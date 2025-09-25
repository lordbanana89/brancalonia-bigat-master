#!/usr/bin/env node

/**
 * Script per correggere automaticamente errori JSON comuni
 */

import fs from 'fs';
import path from 'path';

const DATABASE_PATH = path.resolve(process.cwd(), 'database');

// Lista dei file con errori noti
const PROBLEM_FILES = [
  'incantesimi/livello_1/spell-bollo-di-qualita.json',
  'incantesimi/livello_1/spell-charme.json',
  'incantesimi/livello_1/spell-comprensione-linguaggi.json',
  'incantesimi/livello_1/spell-infliggi-ferite.json',
  'incantesimi/livello_1/spell-marchio-incandescente.json',
  'incantesimi/livello_1/spell-ritirata-veloce.json',
  'incantesimi/livello_2/spell-blocca-persone.json',
  'incantesimi/livello_2/spell-esorcismo.json',
  'incantesimi/livello_2/spell-levitazione.json',
  'incantesimi/livello_2/spell-oscurita.json',
  'incantesimi/livello_2/spell-scurovisione.json',
  'incantesimi/livello_2/spell-silenzio.json',
  'incantesimi/livello_2/spell-suggestione.json',
  'incantesimi/livello_3/spell-banchetto-dei-poveri.json',
  'incantesimi/livello_3/spell-controincantesimo.json',
  'incantesimi/livello_3/spell-emanazione-angelica.json',
  'incantesimi/livello_3/spell-mondare.json',
  'incantesimi/livello_3/spell-velocita.json',
  'incantesimi/livello_4/spell-porta-dimensionale.json'
];

let fixed = 0;
let failed = 0;

/**
 * Corregge un file JSON
 */
function fixJsonFile(filePath) {
  try {
    const fullPath = path.join(DATABASE_PATH, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  File non trovato: ${filePath}`);
      return false;
    }

    // Leggi il contenuto
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Backup
    const backupPath = fullPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, originalContent);
    }

    // Fix 1: Aggiungi virgole mancanti negli array
    // Cerca pattern tipo: "stringa"\n  ] (manca virgola prima di ])
    content = content.replace(/(".*?")\n(\s*\])/g, '$1,\n$2');

    // Fix 2: Aggiungi virgole tra elementi array su righe separate
    // Cerca: "elemento1"\n    "elemento2" (manca virgola)
    content = content.replace(/(".*?")\n(\s+".*?")/g, '$1,\n$2');

    // Fix 3: Rimuovi virgole finali prima di }
    content = content.replace(/,(\s*})/g, '$1');

    // Fix 4: Rimuovi virgole doppie
    content = content.replace(/,,+/g, ',');

    // Fix 5: Sistema array di stringhe malformati
    // Pattern specifico per gli array "utilizzi" che hanno problemi
    content = content.replace(/\[\s*"([^"]+)"\s*"([^"]+)"/g, '[\n    "$1",\n    "$2"');

    // Fix 6: Correggi array con elementi non separati
    const lines = content.split('\n');
    const fixedLines = [];
    let inArray = false;
    let lastWasString = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Detecta inizio array
      if (line.includes('[')) {
        inArray = true;
        lastWasString = false;
      }

      // Detecta fine array
      if (line.includes(']')) {
        inArray = false;
        lastWasString = false;
      }

      // Se siamo in un array e la linea precedente era una stringa
      // e questa linea è una stringa, aggiungi virgola alla precedente
      if (inArray && lastWasString && line.trim().startsWith('"')) {
        const prevIndex = fixedLines.length - 1;
        if (!fixedLines[prevIndex].trim().endsWith(',')) {
          fixedLines[prevIndex] = fixedLines[prevIndex].replace(/(\s*)$/, ',$1');
        }
      }

      fixedLines.push(line);

      // Traccia se questa linea contiene una stringa
      lastWasString = line.trim().startsWith('"') && !line.trim().endsWith(',');
    }

    content = fixedLines.join('\n');

    // Testa il JSON
    try {
      JSON.parse(content);

      // Se il parse ha successo, salva
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Corretto: ${filePath}`);
        fixed++;
        return true;
      } else {
        console.log(`⏭️  Nessuna modifica necessaria: ${filePath}`);
        return true;
      }
    } catch (parseError) {
      // Se ancora non funziona, prova fix più aggressivo
      console.log(`⚠️  Tentativo fix aggressivo: ${filePath}`);

      // Trova la posizione dell'errore
      const errorMatch = parseError.message.match(/position (\d+)/);
      if (errorMatch) {
        const position = parseInt(errorMatch[1]);

        // Trova la linea con l'errore
        let currentPos = 0;
        let lineNum = 0;
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (currentPos + lines[i].length >= position) {
            lineNum = i;
            break;
          }
          currentPos += lines[i].length + 1; // +1 per newline
        }

        // Se la linea precedente non finisce con virgola e non è { o [
        if (lineNum > 0) {
          const prevLine = lines[lineNum - 1].trim();
          const currLine = lines[lineNum].trim();

          if (prevLine.startsWith('"') && !prevLine.endsWith(',') &&
              !prevLine.endsWith('{') && !prevLine.endsWith('[') &&
              (currLine.startsWith('"') || currLine === ']')) {
            lines[lineNum - 1] += ',';
            content = lines.join('\n');

            // Riprova il parse
            try {
              JSON.parse(content);
              fs.writeFileSync(fullPath, content);
              console.log(`✅ Corretto (aggressivo): ${filePath}`);
              fixed++;
              return true;
            } catch (e2) {
              console.error(`❌ Non riesco a correggere: ${filePath}`);
              console.error(`   Errore: ${e2.message}`);
              failed++;
              return false;
            }
          }
        }
      }

      console.error(`❌ Non riesco a correggere: ${filePath}`);
      console.error(`   Errore: ${parseError.message}`);
      failed++;
      return false;
    }

  } catch (error) {
    console.error(`❌ Errore processando ${filePath}: ${error.message}`);
    failed++;
    return false;
  }
}

/**
 * Main
 */
function main() {
  console.log('🔧 Correzione automatica file JSON');
  console.log('=' .repeat(50));
  console.log(`📁 Database: ${DATABASE_PATH}`);
  console.log(`📄 File da correggere: ${PROBLEM_FILES.length}\n`);

  // Correggi ogni file
  PROBLEM_FILES.forEach(file => {
    fixJsonFile(file);
  });

  // Report
  console.log('\n' + '=' .repeat(50));
  console.log('📊 REPORT');
  console.log(`✅ Corretti: ${fixed}`);
  console.log(`❌ Falliti: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 Tutti i file sono stati corretti!');
    console.log('   Puoi ora rieseguire la normalizzazione.');
  } else {
    console.log('\n⚠️  Alcuni file necessitano correzione manuale.');
    process.exit(1);
  }
}

// Esegui
main();