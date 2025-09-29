#!/usr/bin/env node

/**
 * AUTO-TEST FOUNDRY BRANCALONIA
 * Script automatico per testare il modulo in Foundry
 *
 * REQUISITI:
 * npm install puppeteer
 *
 * USO:
 * node auto-test-foundry.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FOUNDRY_URL = 'http://localhost:30000';
const FOUNDRY_PASSWORD = process.env.FOUNDRY_PASSWORD || ''; // Set password se necessaria
const WORLD_NAME = process.env.FOUNDRY_WORLD || ''; // Nome del mondo da aprire

async function runTests() {
  console.log('🚀 Starting Foundry automated tests...');

  const browser = await puppeteer.launch({
    headless: false, // Mostra il browser per debug
    devtools: true,  // Apri DevTools automaticamente
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Cattura console logs
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });

  // Cattura errori
  page.on('error', err => {
    console.error('BROWSER ERROR:', err);
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err);
  });

  try {
    // 1. Vai a Foundry
    console.log(`📍 Navigating to ${FOUNDRY_URL}`);
    await page.goto(FOUNDRY_URL, { waitUntil: 'networkidle2' });

    // 2. Login se necessario
    if (FOUNDRY_PASSWORD) {
      console.log('🔐 Logging in...');
      await page.type('input[name="password"]', FOUNDRY_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }

    // 3. Seleziona mondo
    if (WORLD_NAME) {
      console.log(`🌍 Selecting world: ${WORLD_NAME}`);
      await page.click(`[data-world="${WORLD_NAME}"] button`);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // 4. Aspetta che Foundry sia ready
    console.log('⏳ Waiting for Foundry to be ready...');
    await page.waitForFunction(() => window.game?.ready, {
      timeout: 30000
    });

    // 5. Check modulo Brancalonia
    console.log('🔍 Checking Brancalonia module...');
    const moduleInfo = await page.evaluate(() => {
      const module = game.modules.get('brancalonia-bigat');
      return {
        found: !!module,
        active: module?.active,
        version: module?.version,
        title: module?.title
      };
    });

    console.log('📦 Module status:', moduleInfo);

    if (!moduleInfo.active) {
      console.error('❌ Brancalonia module is not active!');

      // Prova ad attivarlo
      console.log('🔧 Attempting to activate module...');
      await page.evaluate(() => {
        game.settings.set('core', 'moduleConfiguration', {
          ...game.settings.get('core', 'moduleConfiguration'),
          'brancalonia-bigat': true
        });
      });
    }

    // 6. Crea un test actor
    console.log('🎭 Creating test actor...');
    const actor = await page.evaluate(async () => {
      let testActor = game.actors.getName('Brancalonia Test Actor');

      if (!testActor) {
        testActor = await Actor.create({
          name: 'Brancalonia Test Actor',
          type: 'character',
          img: 'icons/svg/mystery-man.svg'
        });
      }

      return {
        id: testActor.id,
        name: testActor.name,
        type: testActor.type
      };
    });

    console.log('✅ Actor created:', actor);

    // 7. Apri actor sheet
    console.log('📄 Opening actor sheet...');
    await page.evaluate((actorId) => {
      const actor = game.actors.get(actorId);
      actor.sheet.render(true);
    }, actor.id);

    // Aspetta che la sheet sia renderizzata
    await page.waitForSelector('.dnd5e.sheet.actor', { timeout: 10000 });

    // 8. Analizza la sheet
    console.log('🔬 Analyzing actor sheet...');
    const sheetAnalysis = await page.evaluate(() => {
      const sheet = document.querySelector('.dnd5e.sheet.actor');

      if (!sheet) return { error: 'Sheet not found' };

      // Cattura screenshot delle classi
      const analysis = {
        classes: sheet.className,
        hasBrancaloniaClass: sheet.classList.contains('brancalonia-sheet'),

        header: {
          exists: !!sheet.querySelector('.sheet-header'),
          classes: sheet.querySelector('.sheet-header')?.className,
          styles: window.getComputedStyle(sheet.querySelector('.sheet-header')),
        },

        portrait: {
          exists: !!sheet.querySelector('.sheet-header .profile'),
          size: {
            width: sheet.querySelector('.sheet-header .profile')?.offsetWidth,
            height: sheet.querySelector('.sheet-header .profile')?.offsetHeight
          }
        },

        abilities: {
          count: sheet.querySelectorAll('.ability').length,
          firstAbility: {
            classes: sheet.querySelector('.ability')?.className,
            width: sheet.querySelector('.ability')?.offsetWidth
          }
        },

        customElements: {
          infamia: !!sheet.querySelector('.infamia-tracker'),
          baraonda: !!sheet.querySelector('.baraonda-tracker')
        },

        cssVariables: {}
      };

      // Test CSS variables
      const testVars = ['--bcl-gold', '--bcl-surface', '--bcl-ink', '--bcl-paper'];
      const computed = window.getComputedStyle(document.documentElement);

      testVars.forEach(v => {
        analysis.cssVariables[v] = computed.getPropertyValue(v) || 'NOT DEFINED';
      });

      return analysis;
    });

    console.log('📊 Sheet Analysis:', JSON.stringify(sheetAnalysis, null, 2));

    // 9. Fai screenshot
    console.log('📸 Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'test-results', 'actor-sheet.png');
    await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`✅ Screenshot saved to ${screenshotPath}`);

    // 10. Test interazioni
    console.log('🎯 Testing interactions...');

    // Test click su abilities
    const abilityTest = await page.evaluate(() => {
      const abilities = document.querySelectorAll('.ability');
      const results = [];

      abilities.forEach(ability => {
        ability.click();
        results.push({
          name: ability.querySelector('.ability-name')?.textContent,
          clickable: true
        });
      });

      return results;
    });

    console.log('Ability clicks:', abilityTest);

    // 11. Genera report
    const report = {
      timestamp: new Date().toISOString(),
      foundryUrl: FOUNDRY_URL,
      module: moduleInfo,
      actor: actor,
      sheetAnalysis: sheetAnalysis,
      screenshot: screenshotPath,
      interactions: abilityTest
    };

    // Salva report
    const reportPath = path.join(__dirname, 'test-results', 'test-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📝 Report saved to ${reportPath}`);

    // 12. Check errori console
    const errors = await page.evaluate(() => {
      return window.__capturedErrors || [];
    });

    if (errors.length > 0) {
      console.error('❌ JavaScript errors detected:', errors);
    } else {
      console.log('✅ No JavaScript errors');
    }

    console.log('\n=================================');
    console.log('✅ TESTS COMPLETED SUCCESSFULLY');
    console.log('=================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error);

    // Screenshot di errore
    const errorScreenshot = path.join(__dirname, 'test-results', 'error.png');
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    console.log(`📸 Error screenshot saved to ${errorScreenshot}`);

  } finally {
    // Non chiudere il browser per permettere ispezione manuale
    console.log('🔍 Browser left open for manual inspection.');
    console.log('Press Ctrl+C to exit.');

    // await browser.close();
  }
}

// Esegui tests
runTests().catch(console.error);

// Handle exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});