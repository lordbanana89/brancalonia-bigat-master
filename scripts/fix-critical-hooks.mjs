#!/usr/bin/env node
/**
 * Script per correggere gli hook critici per compatibilità D&D 5e v3+
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hook che necessitano il suffisso 5e per D&D 5e v3+
const HOOK_UPDATES = [
  // Rendering hooks
  { from: 'renderActorSheet', to: 'renderActorSheet5e' },
  { from: 'renderItemSheet', to: 'renderItemSheet5e' },
  { from: 'renderItemSheetV2', to: 'renderItemSheet5e' },

  // Pre/Post hooks che potrebbero necessitare modifiche
  { from: 'preCreateItem', to: 'preCreateItem' },
  { from: 'createItem', to: 'createItem' },
  { from: 'preUpdateItem', to: 'preUpdateItem' },
  { from: 'updateItem', to: 'updateItem' },
  { from: 'preDeleteItem', to: 'preDeleteItem' },
  { from: 'deleteItem', to: 'deleteItem' },

  { from: 'preCreateActor', to: 'preCreateActor' },
  { from: 'createActor', to: 'createActor' },
  { from: 'preUpdateActor', to: 'preUpdateActor' },
  { from: 'updateActor', to: 'updateActor' },
  { from: 'preDeleteActor', to: 'preDeleteActor' },
  { from: 'deleteActor', to: 'deleteActor' }
];

class HookFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  findFiles(dir, extensions = ['.js', '.mjs']) {
    let results = [];
    const ignoreDirs = ['node_modules', '.git', 'packs', 'dist', 'build'];

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!ignoreDirs.includes(file)) {
          results = results.concat(this.findFiles(filePath, extensions));
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }

    return results;
  }

  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      let modified = false;

      // Solo processa file che usano D&D 5e
      if (!content.includes('dnd5e') && !content.includes('DND5E')) {
        return;
      }

      // Correggi renderItemSheetV2 -> renderItemSheet5e
      if (content.includes('renderItemSheetV2')) {
        content = content.replace(
          /Hooks\.(on|once)\(['"]renderItemSheetV2['"]/g,
          'Hooks.$1("renderItemSheet5e"'
        );
        modified = true;
        console.log(`  🔧 Fixed renderItemSheetV2 -> renderItemSheet5e`);
      }

      // Correggi renderActorSheet -> renderActorSheet5e
      if (content.includes('renderActorSheet') && !content.includes('renderActorSheet5e')) {
        content = content.replace(
          /Hooks\.(on|once)\(['"]renderActorSheet['"]/g,
          'Hooks.$1("renderActorSheet5e"'
        );
        modified = true;
        console.log(`  🔧 Fixed renderActorSheet -> renderActorSheet5e`);
      }

      // Correggi renderItemSheet -> renderItemSheet5e
      if (content.includes('renderItemSheet') && !content.includes('renderItemSheet5e')) {
        content = content.replace(
          /Hooks\.(on|once)\(['"]renderItemSheet['"]/g,
          'Hooks.$1("renderItemSheet5e"'
        );
        modified = true;
        console.log(`  🔧 Fixed renderItemSheet -> renderItemSheet5e`);
      }

      // Per i CRUD hooks, verifica che usino i parametri corretti
      const crudHooks = [
        'createItem', 'updateItem', 'deleteItem',
        'createActor', 'updateActor', 'deleteActor'
      ];

      for (const hookName of crudHooks) {
        const hookRegex = new RegExp(`Hooks\\.(on|once)\\(['"]${hookName}['"]`, 'g');
        if (hookRegex.test(content)) {
          // Verifica che il callback usi i parametri corretti
          const callbackRegex = new RegExp(
            `Hooks\\.(on|once)\\(['"]${hookName}['"],\\s*(?:async\\s*)?\\((\\w+),\\s*(\\w+),\\s*(\\w+)(?:,\\s*(\\w+))?\\)`,
            'g'
          );

          let match;
          while ((match = callbackRegex.exec(content)) !== null) {
            const [full, method, param1, param2, param3, param4] = match;

            // Per Foundry V13, i parametri dovrebbero essere:
            // createItem: (item, options, userId)
            // updateItem: (item, changes, options, userId)
            // deleteItem: (item, options, userId)

            console.log(`  ℹ️  Found ${hookName} hook with params: ${param1}, ${param2}, ${param3}${param4 ? ', ' + param4 : ''}`);
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixes.push(relativePath);
        console.log(`✅ Fixed: ${relativePath}`);
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  run() {
    console.log('=' .repeat(60));
    console.log('🪝 BRANCALONIA HOOK FIXER');
    console.log('=' .repeat(60) + '\n');

    const basePath = path.join(__dirname, '..');
    const modulesPath = path.join(basePath, 'modules');

    console.log('🔍 Scanning for hooks to fix...\n');

    const files = this.findFiles(modulesPath);
    console.log(`Found ${files.length} JavaScript files\n`);

    for (const file of files) {
      this.processFile(file);
    }

    // Report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 REPORT');
    console.log('=' .repeat(60) + '\n');

    if (this.fixes.length > 0) {
      console.log(`✅ Fixed ${this.fixes.length} files:`);
      this.fixes.forEach(f => console.log(`   - ${f}`));
    } else {
      console.log('✨ No hook fixes needed!');
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors in ${this.errors.length} files:`);
      this.errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
    }

    // Verifica hooks rimanenti che potrebbero necessitare attenzione
    console.log('\n🔎 Verificando hooks rimanenti...\n');
    this.verifyRemainingHooks(files);
  }

  verifyRemainingHooks(files) {
    const criticalHooks = new Set();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(path.join(__dirname, '..'), file);

        // Cerca hooks che potrebbero essere problematici
        const hookPattern = /Hooks\.(on|once)\(['"](\w+)['"]/g;
        let match;

        while ((match = hookPattern.exec(content)) !== null) {
          const hookName = match[2];

          // Hook che potrebbero necessitare attenzione
          if (hookName.includes('Item') || hookName.includes('Actor')) {
            if (!hookName.includes('5e') && content.includes('dnd5e')) {
              if (!['createItem', 'updateItem', 'deleteItem',
                     'createActor', 'updateActor', 'deleteActor',
                     'preCreateItem', 'preUpdateItem', 'preDeleteItem',
                     'preCreateActor', 'preUpdateActor', 'preDeleteActor'].includes(hookName)) {
                criticalHooks.add(`${hookName} in ${relativePath}`);
              }
            }
          }
        }
      } catch (error) {
        // Skip
      }
    }

    if (criticalHooks.size > 0) {
      console.log('⚠️  Hooks che potrebbero necessitare revisione manuale:');
      criticalHooks.forEach(h => console.log(`   - ${h}`));
    } else {
      console.log('✅ Tutti gli hooks sono compatibili!');
    }
  }
}

// Run
const fixer = new HookFixer();
fixer.run();