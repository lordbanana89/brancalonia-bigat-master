/**
 * Fix per gli ID non validi nei compendium packs
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FIX ID COMPENDIUM PACKS\n');
console.log('=' .repeat(50));

const packsDir = path.join(__dirname, 'packs');
let totalFixed = 0;
let totalFiles = 0;

// Funzione per generare un ID valido di 16 caratteri
function generateValidId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Funzione per validare un ID
function isValidId(id) {
  return /^[A-Za-z0-9]{16}$/.test(id);
}

// Processa tutti i file .db nei packs
function processPackFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processPackFiles(filePath);
    } else if (file.endsWith('.db') || file === 'CURRENT' || file === 'MANIFEST' || file === 'LOG') {
      // Salta i file di sistema LevelDB
      return;
    } else if (!file.includes('.')) {
      // File senza estensione sono probabilmente file LevelDB
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Cerca pattern JSON nel contenuto
        if (content.includes('"_id"')) {
          totalFiles++;
          let modified = false;
          let newContent = content;
          
          // Trova tutti gli _id nel file
          const idMatches = content.match(/"_id"\s*:\s*"([^"]+)"/g);
          
          if (idMatches) {
            idMatches.forEach(match => {
              const id = match.match(/"_id"\s*:\s*"([^"]+)"/)[1];
              
              if (!isValidId(id)) {
                console.log(`❌ ID non valido trovato: ${id} in ${file}`);
                const newId = generateValidId();
                newContent = newContent.replace(`"_id":"${id}"`, `"_id":"${newId}"`);
                newContent = newContent.replace(`"_id": "${id}"`, `"_id": "${newId}"`);
                newContent = newContent.replace(`"_id" : "${id}"`, `"_id": "${newId}"`);
                modified = true;
                totalFixed++;
                console.log(`✅ Sostituito con: ${newId}`);
              }
            });
          }
          
          if (modified) {
            fs.writeFileSync(filePath, newContent, 'utf8');
          }
        }
      } catch (e) {
        // File binario, skip
      }
    }
  });
}

// Processa i file JSON nella directory _source
function processSourceFiles(dir) {
  const sourceDir = path.join(dir, '_source');
  
  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(sourceDir, file);
        totalFiles++;
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          
          if (data._id && !isValidId(data._id)) {
            console.log(`❌ ID non valido in ${file}: ${data._id}`);
            data._id = generateValidId();
            console.log(`✅ Nuovo ID: ${data._id}`);
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            totalFixed++;
          }
          
          // Controlla anche array di items
          if (Array.isArray(data)) {
            let modified = false;
            data.forEach(item => {
              if (item._id && !isValidId(item._id)) {
                console.log(`❌ ID non valido in ${file}: ${item._id}`);
                item._id = generateValidId();
                console.log(`✅ Nuovo ID: ${item._id}`);
                modified = true;
                totalFixed++;
              }
            });
            
            if (modified) {
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            }
          }
        } catch (e) {
          console.log(`⚠️ Errore processando ${file}: ${e.message}`);
        }
      }
    });
  }
}

// Cerca nelle sottocartelle dei packs
const packDirs = fs.readdirSync(packsDir).filter(d => {
  const stat = fs.statSync(path.join(packsDir, d));
  return stat.isDirectory();
});

console.log(`\n📂 Trovate ${packDirs.length} directory di pack\n`);

packDirs.forEach(packDir => {
  console.log(`\n📦 Processando pack: ${packDir}`);
  const packPath = path.join(packsDir, packDir);
  
  // Processa file LevelDB
  processPackFiles(packPath);
  
  // Processa file JSON source
  processSourceFiles(packPath);
});

console.log('\n' + '=' .repeat(50));
console.log('📊 REPORT FINALE\n');
console.log(`File processati: ${totalFiles}`);
console.log(`ID corretti: ${totalFixed}`);

if (totalFixed > 0) {
  console.log('\n⚠️ IMPORTANTE:');
  console.log('1. Riavvia Foundry per applicare le modifiche');
  console.log('2. Potrebbe essere necessario ricompilare i packs');
  console.log('3. Usa: npm run build:packs (se disponibile)');
} else {
  console.log('\n✅ Tutti gli ID sono già validi!');
}

process.exit(0);
