#!/usr/bin/env node

/**
 * Fix per aggiornare gli hook renderActorSheetV2 alla struttura corretta di Foundry v13
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

console.log('Fixing renderActorSheetV2 hooks per Foundry v13...\n');

filesToFix.forEach(filename => {
  const filepath = path.join(modulesPath, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File non trovato: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');
  const originalContent = content;

  // Fix principale: negli hook renderActorSheetV2, usa app.actor invece di data.actor
  // Trova tutti gli hook renderActorSheetV2
  content = content.replace(
    /Hooks\.on\("renderActorSheetV2",\s*\(app,\s*html,\s*data\)\s*=>\s*{/g,
    'Hooks.on("renderActorSheetV2", (app, html, data) => {'
  );

  // Sostituisci data.actor con app.actor solo dentro gli hook
  const hookPattern = /Hooks\.on\("renderActorSheetV2"[^}]+\}\);/gs;
  content = content.replace(hookPattern, (match) => {
    return match.replace(/data\.actor/g, 'app.actor');
  });

  // Fix per le chiamate alle funzioni
  const functionReplacements = [
    {
      pattern: /_addCompagniaTab\(app,\s*html,\s*data\)/g,
      replacement: '_addCompagniaTab(app, html)'
    },
    {
      pattern: /_renderCovoUI\(app,\s*html,\s*data\)/g,
      replacement: '_renderCovoUI(app, html)'
    },
    {
      pattern: /_renderFavoriUI\(app,\s*html,\s*data\)/g,
      replacement: '_renderFavoriUI(app, html)'
    },
    {
      pattern: /_renderTagliaSection\(app,\s*html,\s*data\)/g,
      replacement: '_renderTagliaSection(app, html)'
    }
  ];

  functionReplacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  // Fix per le definizioni delle funzioni
  const functionDefinitions = [
    {
      pattern: /_addCompagniaTab\(app,\s*html,\s*data\)\s*{/g,
      replacement: '_addCompagniaTab(app, html) {',
      dataReplacement: true
    },
    {
      pattern: /_renderCovoUI\(app,\s*html,\s*data\)\s*{/g,
      replacement: '_renderCovoUI(app, html) {',
      dataReplacement: true
    },
    {
      pattern: /_renderFavoriUI\(app,\s*html,\s*data\)\s*{/g,
      replacement: '_renderFavoriUI(app, html) {',
      dataReplacement: true
    },
    {
      pattern: /_renderTagliaSection\(app,\s*html,\s*data\)\s*{/g,
      replacement: '_renderTagliaSection(app, html) {',
      dataReplacement: true
    }
  ];

  functionDefinitions.forEach(({ pattern, replacement }) => {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);

      // Trova la funzione e sostituisci data.actor con app.actor nel corpo
      const funcName = replacement.match(/_\w+/)[0];
      const funcPattern = new RegExp(`${funcName}\\([^)]*\\)\\s*{[^}]*}`, 'gs');

      content = content.replace(funcPattern, (match) => {
        // Sostituisci data.actor con app.actor nel corpo della funzione
        return match.replace(/data\.actor/g, 'app.actor');
      });
    }
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