/**
 * Test del modulo Brancalonia con Foundry locale
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Test Brancalonia Module con Foundry VTT locale\n');
console.log('=' .repeat(50));

// Percorsi
const foundryPath = path.join(__dirname, '.claude', 'Foundry zip node', 'FoundryVTT-Node-13.348');
const modulePath = __dirname;

// Verifica che Foundry esista
if (!fs.existsSync(foundryPath)) {
  console.error('❌ Foundry non trovato in:', foundryPath);
  process.exit(1);
}

console.log('📁 Foundry path:', foundryPath);
console.log('📁 Module path:', modulePath);
console.log('\n🔧 Avvio Foundry in modalità test...\n');

// Avvia Foundry con data path esterno
const foundry = spawn('node', [
  'main.js',
  '--port=30123',
  '--headless',
  '--dataPath=/tmp/foundry-test-data',
  '--noupdate'
], {
  cwd: foundryPath,
  env: { ...process.env, NODE_ENV: 'development' }
});

let errorCount = 0;
let warningCount = 0;
const brancaloniaErrors = [];
const brancaloniaWarnings = [];

// Timeout 20 secondi
const timeout = setTimeout(() => {
  console.log('\n⏰ Test completato (timeout)');
  foundry.kill('SIGTERM');
}, 20000);

// Cattura output
foundry.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Filtra solo messaggi Brancalonia
  if (output.toLowerCase().includes('brancalonia')) {
    process.stdout.write(output);
    
    if (output.toLowerCase().includes('error')) {
      errorCount++;
      brancaloniaErrors.push(output.trim());
    } else if (output.toLowerCase().includes('warning')) {
      warningCount++;
      brancaloniaWarnings.push(output.trim());
    }
  }
});

// Cattura errori
foundry.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.toLowerCase().includes('brancalonia')) {
    console.error('❌ ERRORE:', error);
    errorCount++;
    brancaloniaErrors.push(error.trim());
  }
});

// Chiusura
foundry.on('close', (code) => {
  clearTimeout(timeout);
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 REPORT TEST BRANCALONIA\n');
  
  if (brancaloniaErrors.length > 0) {
    console.log('❌ ERRORI TROVATI:');
    brancaloniaErrors.forEach(e => console.log('  -', e.substring(0, 100)));
  }
  
  if (brancaloniaWarnings.length > 0) {
    console.log('\n⚠️ WARNING TROVATI:');
    brancaloniaWarnings.forEach(w => console.log('  -', w.substring(0, 100)));
  }
  
  console.log('\n📈 SOMMARIO:');
  console.log(`  Errori: ${errorCount}`);
  console.log(`  Warning: ${warningCount}`);
  
  if (errorCount === 0 && warningCount === 0) {
    console.log('\n✅ IL MODULO SEMBRA FUNZIONARE!');
  } else if (errorCount === 0) {
    console.log('\n⚠️ IL MODULO FUNZIONA MA HA WARNING');
  } else {
    console.log('\n❌ IL MODULO HA ERRORI');
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
});

foundry.on('error', (err) => {
  console.error('❌ Errore avvio Foundry:', err);
  clearTimeout(timeout);
  process.exit(1);
});
