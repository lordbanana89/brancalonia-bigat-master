#!/usr/bin/env node

/**
 * Fix per convertire html in jQuery object negli hook renderActorSheetV2
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '..', 'modules');

// Files che usano renderActorSheetV2
const filesToFix = [
  'covo-granlussi.js',
  'compagnia-manager.js',
  'bagordi.js',
  'brancalonia-equitaglia.js',
  'favori-system.js',
  'malefatte-taglie-nomea.js'
];

console.log('Fixing html jQuery conversion per Foundry v13...\n');

filesToFix.forEach(filename => {
  const filepath = path.join(modulesPath, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File non trovato: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');
  const originalContent = content;

  // Trova tutti gli hook renderActorSheetV2 e aggiungi conversione jQuery se necessario
  content = content.replace(
    /Hooks\.on\("renderActorSheetV2",\s*\(app,\s*html,\s*data\)\s*=>\s*{/g,
    'Hooks.on("renderActorSheetV2", (app, html, data) => {\n    // Converti html in jQuery object per Foundry v13\n    const $html = $(html);'
  );

  // Sostituisci tutti i riferimenti a html con $html all'interno degli hook
  const hookPattern = /Hooks\.on\("renderActorSheetV2"[^}]+\}\);/gs;

  content = content.replace(hookPattern, (match) => {
    // Solo se abbiamo aggiunto la conversione
    if (match.includes('const $html = $(html)')) {
      // Sostituisci html. con $html. ma non $(html)
      let modifiedMatch = match.replace(/(?<![\$\(])html\./g, '$html.');
      // Sostituisci html.find, html.append, etc.
      modifiedMatch = modifiedMatch.replace(/(?<![\$\(])html\.find/g, '$html.find');
      modifiedMatch = modifiedMatch.replace(/(?<![\$\(])html\.append/g, '$html.append');
      modifiedMatch = modifiedMatch.replace(/(?<![\$\(])html\.prepend/g, '$html.prepend');
      modifiedMatch = modifiedMatch.replace(/(?<![\$\(])html\.click/g, '$html.click');
      modifiedMatch = modifiedMatch.replace(/(?<![\$\(])html\.on/g, '$html.on');

      // Per chiamate a funzioni, sostituisci html come parametro
      modifiedMatch = modifiedMatch.replace(/this\._\w+\(app,\s*html\)/g, (funcCall) => {
        return funcCall.replace(', html)', ', $html)');
      });

      return modifiedMatch;
    }
    return match;
  });

  // Fix specifico per brancalonia-equitaglia.js che è diverso
  if (filename === 'brancalonia-equitaglia.js') {
    // Questo file ha l'hook fuori dalla classe
    content = content.replace(
      /Hooks\.on\("renderActorSheetV2",\s*\(app,\s*html,\s*data\)\s*=>\s*{/g,
      'Hooks.on("renderActorSheetV2", (app, html, data) => {\n  // Converti html in jQuery object per Foundry v13\n  const $html = $(html);'
    );

    // Sostituisci html con $html nel corpo
    content = content.replace(/html\.find\(/g, '$html.find(');
    content = content.replace(/html\.append\(/g, '$html.append(');
    content = content.replace(/html\.prepend\(/g, '$html.prepend(');
  }

  // Fix anche le definizioni delle funzioni che ricevono html
  const functionPatterns = [
    '_addCompagniaTab',
    '_renderCovoUI',
    '_renderFavoriUI',
    '_renderTagliaSection'
  ];

  functionPatterns.forEach(funcName => {
    const pattern = new RegExp(`${funcName}\\(app,\\s*html\\)\\s*{`, 'g');
    content = content.replace(pattern, `${funcName}(app, html) {\n    // Converti html in jQuery object se necessario\n    const $html = $(html);`);

    // Sostituisci html con $html nel corpo della funzione
    const funcBodyPattern = new RegExp(`${funcName}\\([^)]*\\)\\s*{[^}]*}`, 'gs');
    content = content.replace(funcBodyPattern, (match) => {
      if (match.includes('const $html = $(html)')) {
        return match.replace(/(?<![\$\(])html\./g, '$html.');
      }
      return match;
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content);
    console.log(`✅ Fixed: ${filename}`);
  } else {
    console.log(`ℹ️  Nessuna modifica necessaria: ${filename}`);
  }
});

console.log('\n✨ Fix completato!');
console.log('Riavvia Foundry per applicare le modifiche.');