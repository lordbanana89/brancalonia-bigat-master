#!/usr/bin/env node
/**
 * Corregge gli hook per D&D 5e v3+ con i nomi corretti
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hook corretti per D&D 5e v3+
const CORRECT_HOOKS = {
  // Per Actor sheets
  'renderActorSheet5e': ['renderActorSheet5eCharacter', 'renderActorSheet5eNPC'],
  'renderActorSheetV2': ['renderActorSheet5eCharacter', 'renderActorSheet5eNPC'],

  // Per Item sheets
  'renderItemSheet5e': 'renderItemSheet5e', // Questo è corretto
  'renderItemSheetV2': 'renderItemSheet5e',
  'renderItemSheet': 'renderItemSheet5e'
};

class HookCorrector {
  constructor() {
    this.fixes = [];
  }

  findAndFix() {
    const modulesPath = path.join(__dirname, '..', 'modules');
    const files = this.findJSFiles(modulesPath);

    console.log(`🔍 Analizzando ${files.length} file JavaScript...\n`);

    for (const file of files) {
      this.processFile(file);
    }

    return this.fixes;
  }

  findJSFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && file !== 'node_modules') {
        results = results.concat(this.findJSFiles(filePath));
      } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
        results.push(filePath);
      }
    }

    return results;
  }

  processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const fileName = path.basename(filePath);

    // Controlla se usa D&D 5e
    if (!content.includes('dnd5e') && !content.includes('DND5E')) {
      return;
    }

    // Trova tutti gli hook di rendering errati
    const hookPattern = /Hooks\.(on|once)\(["']renderActorSheet5e["']/g;
    let match;
    let hasActorSheetHooks = false;

    while ((match = hookPattern.exec(content)) !== null) {
      hasActorSheetHooks = true;
    }

    if (hasActorSheetHooks) {
      console.log(`⚠️  File con hook errato: ${fileName}`);

      // Determina quale hook usare in base al contesto
      // Se il file gestisce sia character che npc, deve registrare entrambi
      const needsCharacter = content.includes('character') || content.includes('Character') || content.includes('PC');
      const needsNPC = content.includes('npc') || content.includes('NPC') || content.includes('monster');

      if (needsCharacter || needsNPC || (!needsCharacter && !needsNPC)) {
        // Se non è chiaro o serve entrambi, registra entrambi gli hook
        console.log(`  📝 Necessita correzione per Actor sheets`);

        // Trova ogni istanza e sostituisci con entrambi gli hook
        const lines = content.split('\n');
        const newLines = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.includes('Hooks.on("renderActorSheet5e"') || line.includes("Hooks.on('renderActorSheet5e'")) {
            // Estrai l'indentazione
            const indent = line.match(/^\s*/)[0];

            // Trova la funzione callback
            let callbackStart = i;
            let bracketCount = 0;
            let inCallback = false;
            let callbackLines = [];

            // Cerca l'inizio della callback
            for (let j = i; j < lines.length && j < i + 50; j++) {
              const checkLine = lines[j];

              if (j === i) {
                // Prima linea - trova l'inizio della funzione
                const funcMatch = checkLine.match(/\((app|sheet), (html|element), (data|context)/);
                if (funcMatch) {
                  inCallback = true;
                }
              }

              if (inCallback) {
                callbackLines.push(lines[j]);

                // Conta parentesi per trovare la fine
                for (const char of checkLine) {
                  if (char === '{') bracketCount++;
                  if (char === '}') bracketCount--;
                }

                if (bracketCount === 0 && j > i) {
                  // Fine della callback trovata
                  break;
                }
              }
            }

            // Crea la callback come variabile
            const callbackName = `modify${needsCharacter ? 'Character' : 'Actor'}Sheet`;
            const callbackDef = callbackLines.join('\n').replace(/^Hooks\.(on|once)\(["']renderActorSheet5e["'],\s*/, '');

            // Aggiungi commento esplicativo
            newLines.push(`${indent}// Hook per D&D 5e v3+ - Actor sheets`);
            newLines.push(`${indent}const ${callbackName} = ${callbackDef}`);
            newLines.push(`${indent}Hooks.on("renderActorSheet5eCharacter", ${callbackName});`);
            newLines.push(`${indent}Hooks.on("renderActorSheet5eNPC", ${callbackName});`);

            // Salta le linee della vecchia callback
            i += callbackLines.length - 1;

            this.fixes.push({
              file: fileName,
              fix: 'Corretto renderActorSheet5e -> renderActorSheet5eCharacter + renderActorSheet5eNPC'
            });
          } else {
            newLines.push(line);
          }
        }

        content = newLines.join('\n');
      }
    }

    // Salva se modificato
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corretto: ${fileName}\n`);
    }
  }

  report() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT CORREZIONI HOOK D&D 5e v3+');
    console.log('='.repeat(60) + '\n');

    if (this.fixes.length === 0) {
      console.log('✅ Tutti gli hook sono già corretti!');
    } else {
      console.log(`🔧 Corretti ${this.fixes.length} file:\n`);
      this.fixes.forEach(f => {
        console.log(`  - ${f.file}: ${f.fix}`);
      });
    }
  }
}

// Esegui
console.log('='.repeat(60));
console.log('🪝 CORREZIONE HOOK D&D 5e v3+');
console.log('='.repeat(60) + '\n');

const corrector = new HookCorrector();
corrector.findAndFix();
corrector.report();