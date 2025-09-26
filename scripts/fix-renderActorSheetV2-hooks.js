#!/usr/bin/env node

/**
 * Fix per aggiornare gli hook renderActorSheetV2 alla struttura corretta di Foundry v13
 */

const fs = require('fs');
const path = require('path');

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

filesToFix.forEach(filename => {
  const filepath = path.join(modulesPath, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File non trovato: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');
  let modified = false;

  // Fix 1: data.actor -> app.actor
  if (content.includes('data.actor')) {
    // Sostituisci data.actor con app.actor negli hook renderActorSheetV2
    content = content.replace(
      /Hooks\.on\("renderActorSheetV2",\s*\(app,\s*html,\s*data\)\s*=>\s*{([^}]*data\.actor[^}]*)\}/g,
      (match, body) => {
        const fixedBody = body.replace(/data\.actor/g, 'app.actor');
        return `Hooks.on("renderActorSheetV2", (app, html, data) => {${fixedBody}}`;
      }
    );

    // Fix anche per funzioni chiamate dentro l'hook
    content = content.replace(
      /_addCompagniaTab\(app,\s*html,\s*data\)/g,
      '_addCompagniaTab(app, html, app.actor)'
    );

    content = content.replace(
      /_renderCovoUI\(app,\s*html,\s*data\)/g,
      '_renderCovoUI(app, html, app.actor)'
    );

    content = content.replace(
      /_renderFavoriUI\(app,\s*html,\s*data\)/g,
      '_renderFavoriUI(app, html, app.actor)'
    );

    content = content.replace(
      /_renderTagliaSection\(app,\s*html,\s*data\)/g,
      '_renderTagliaSection(app, html, app.actor)'
    );

    modified = true;
  }

  // Fix 2: Aggiorna le funzioni per ricevere actor invece di data
  if (content.includes('_addCompagniaTab(app, html, data)')) {
    content = content.replace(
      /_addCompagniaTab\(app,\s*html,\s*data\)\s*{/g,
      '_addCompagniaTab(app, html, actor) {'
    );

    content = content.replace(
      /const compagniaId = data\.actor\.flags/g,
      'const compagniaId = actor.flags'
    );

    modified = true;
  }

  // Fix simili per altre funzioni
  const functionPatterns = [
    { old: /_renderCovoUI\(app,\s*html,\s*data\)/, new: '_renderCovoUI(app, html, actor)' },
    { old: /_renderFavoriUI\(app,\s*html,\s*data\)/, new: '_renderFavoriUI(app, html, actor)' },
    { old: /_renderTagliaSection\(app,\s*html,\s*data\)/, new: '_renderTagliaSection(app, html, actor)' }
  ];

  functionPatterns.forEach(pattern => {
    if (content.includes(pattern.old)) {
      content = content.replace(pattern.old, pattern.new);
      // Sostituisci data.actor con actor nel corpo della funzione
      content = content.replace(/data\.actor/g, 'actor');
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filepath, content);
    console.log(`✅ Fixed: ${filename}`);
  } else {
    console.log(`ℹ️  Nessuna modifica necessaria: ${filename}`);
  }
});

console.log('\n✨ Fix completato!');
console.log('Riavvia Foundry per applicare le modifiche.');