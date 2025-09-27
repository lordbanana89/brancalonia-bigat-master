#!/usr/bin/env node
/**
 * Script per identificare e correggere tutti i warning e problemi critici
 * del progetto Brancalonia per Foundry V13+
 */

const fs = require('fs');
const path = require('path');

// Mappatura hook deprecati -> nuovi
const HOOK_MAPPINGS = {
  'renderChatMessage': 'renderChatMessage',  // Verifica parametri
  'renderActorSheet': 'renderActorSheet5e',  // Per D&D 5e
  'renderItemSheet': 'renderItemSheet5e',
  'updateActor': 'updateActor',              // Verifica .system
  'updateItem': 'updateItem',
  'createActor': 'createActor',
  'createItem': 'createItem',
  'preUpdateActor': 'preUpdateActor',
  'preUpdateItem': 'preUpdateItem'
};

// Pattern API deprecate
const DEPRECATED_PATTERNS = [
  {
    pattern: /game\.actors\.entities/g,
    replacement: 'game.actors',
    description: 'game.actors.entities -> game.actors'
  },
  {
    pattern: /game\.items\.entities/g,
    replacement: 'game.items',
    description: 'game.items.entities -> game.items'
  },
  {
    pattern: /actor\.data\.data/g,
    replacement: 'actor.system',
    description: 'actor.data.data -> actor.system'
  },
  {
    pattern: /item\.data\.data/g,
    replacement: 'item.system',
    description: 'item.data.data -> item.system'
  },
  {
    pattern: /\.data\.flags/g,
    replacement: '.flags',
    description: '.data.flags -> .flags'
  },
  {
    pattern: /CONFIG\.(Actor|Item)\.entityClass/g,
    replacement: 'CONFIG.$1.documentClass',
    description: 'CONFIG.*.entityClass -> CONFIG.*.documentClass'
  },
  {
    pattern: /mergeObject\(/g,
    replacement: 'foundry.utils.mergeObject(',
    description: 'mergeObject -> foundry.utils.mergeObject'
  },
  {
    pattern: /duplicate\(/g,
    replacement: 'foundry.utils.deepClone(',
    description: 'duplicate -> foundry.utils.deepClone'
  },
  {
    pattern: /isObjectEmpty\(/g,
    replacement: 'foundry.utils.isEmpty(',
    description: 'isObjectEmpty -> foundry.utils.isEmpty'
  },
  {
    pattern: /getProperty\(/g,
    replacement: 'foundry.utils.getProperty(',
    description: 'getProperty -> foundry.utils.getProperty'
  },
  {
    pattern: /setProperty\(/g,
    replacement: 'foundry.utils.setProperty(',
    description: 'setProperty -> foundry.utils.setProperty'
  },
  {
    pattern: /hasProperty\(/g,
    replacement: 'foundry.utils.hasProperty(',
    description: 'hasProperty -> foundry.utils.hasProperty'
  }
];

class ProjectFixer {
  constructor(basePath) {
    this.basePath = basePath;
    this.issues = [];
    this.fixes = [];
  }

  // Scansiona tutti i file JS/MJS
  async scanProject() {
    console.log('🔍 Scansione del progetto per warning e problemi...\n');

    const jsFiles = this.findFiles(this.basePath, ['.js', '.mjs']);
    console.log(`📁 Trovati ${jsFiles.length} file JavaScript\n`);

    for (const file of jsFiles) {
      await this.scanFile(file);
    }

    return this.issues;
  }

  // Trova tutti i file con estensioni specifiche
  findFiles(dir, extensions) {
    let results = [];

    // Skip node_modules e altre directory da ignorare
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

  // Scansiona un singolo file per problemi
  async scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.basePath, filePath);

    let hasIssues = false;

    // Cerca API deprecate
    for (const deprecation of DEPRECATED_PATTERNS) {
      if (deprecation.pattern.test(content)) {
        this.issues.push({
          file: relativePath,
          type: 'deprecated',
          description: deprecation.description,
          pattern: deprecation.pattern.source
        });
        hasIssues = true;
      }
      // Reset regex
      deprecation.pattern.lastIndex = 0;
    }

    // Cerca hook deprecati per D&D 5e v3+
    const hookPattern = /Hooks\.(on|once)\(['"](\w+)['"]/g;
    let match;
    while ((match = hookPattern.exec(content)) !== null) {
      const hookName = match[2];
      if (hookName.includes('Actor') || hookName.includes('Item')) {
        // Verifica se usa il sistema 5e
        if (!hookName.includes('5e') && content.includes('dnd5e')) {
          this.issues.push({
            file: relativePath,
            type: 'hook',
            description: `Hook potenzialmente deprecato: ${hookName}`,
            line: this.getLineNumber(content, match.index)
          });
          hasIssues = true;
        }
      }
    }

    // Cerca TODO/FIXME
    const todoPattern = /\/\/\s*(TODO|FIXME|XXX|HACK):?\s*(.+)/gi;
    while ((match = todoPattern.exec(content)) !== null) {
      this.issues.push({
        file: relativePath,
        type: 'todo',
        description: `${match[1]}: ${match[2]}`,
        line: this.getLineNumber(content, match.index)
      });
    }

    // Cerca console.log (dovrebbe essere rimosso in produzione)
    const consolePattern = /console\.(log|warn|error|debug)\(/g;
    while ((match = consolePattern.exec(content)) !== null) {
      // Ignora se è commentato
      const lineStart = content.lastIndexOf('\n', match.index);
      const lineContent = content.substring(lineStart, match.index);
      if (!lineContent.includes('//')) {
        this.issues.push({
          file: relativePath,
          type: 'console',
          description: `console.${match[1]} in produzione`,
          line: this.getLineNumber(content, match.index)
        });
      }
    }

    if (hasIssues) {
      console.log(`⚠️  Problemi trovati in: ${relativePath}`);
    }
  }

  // Ottieni numero di linea da indice
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Correggi automaticamente i problemi
  async fixIssues() {
    console.log('\n🔧 Correzione automatica dei problemi...\n');

    const fileMap = new Map();

    // Raggruppa issues per file
    for (const issue of this.issues) {
      if (issue.type === 'deprecated' || issue.type === 'hook') {
        if (!fileMap.has(issue.file)) {
          fileMap.set(issue.file, []);
        }
        fileMap.get(issue.file).push(issue);
      }
    }

    // Correggi ogni file
    for (const [file, issues] of fileMap) {
      const filePath = path.join(this.basePath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Applica correzioni per deprecazioni
      for (const deprecation of DEPRECATED_PATTERNS) {
        if (deprecation.pattern.test(content)) {
          content = content.replace(deprecation.pattern, deprecation.replacement);
          modified = true;
          this.fixes.push({
            file,
            fix: deprecation.description
          });
        }
        deprecation.pattern.lastIndex = 0;
      }

      // Correggi hook per D&D 5e
      if (content.includes('dnd5e')) {
        // Hook di rendering
        content = content.replace(
          /Hooks\.(on|once)\(['"]renderActorSheet['"]/g,
          'Hooks.$1("renderActorSheet5e"'
        );
        content = content.replace(
          /Hooks\.(on|once)\(['"]renderItemSheet['"]/g,
          'Hooks.$1("renderItemSheet5e"'
        );

        if (modified) {
          this.fixes.push({
            file,
            fix: 'Aggiornati hook per D&D 5e v3+'
          });
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Corretto: ${file}`);
      }
    }
  }

  // Genera report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT PROBLEMI E CORREZIONI');
    console.log('='.repeat(60) + '\n');

    // Raggruppa per tipo
    const byType = {};
    for (const issue of this.issues) {
      if (!byType[issue.type]) {
        byType[issue.type] = [];
      }
      byType[issue.type].push(issue);
    }

    // Report per tipo
    for (const [type, issues] of Object.entries(byType)) {
      console.log(`\n${this.getTypeEmoji(type)} ${type.toUpperCase()}: ${issues.length} problemi`);

      // Mostra primi 5 esempi
      for (let i = 0; i < Math.min(5, issues.length); i++) {
        const issue = issues[i];
        console.log(`   - ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`     ${issue.description}`);
      }

      if (issues.length > 5) {
        console.log(`   ... e altri ${issues.length - 5} problemi`);
      }
    }

    // Report correzioni
    if (this.fixes.length > 0) {
      console.log('\n✨ CORREZIONI APPLICATE:');
      const fixMap = {};
      for (const fix of this.fixes) {
        if (!fixMap[fix.fix]) {
          fixMap[fix.fix] = 0;
        }
        fixMap[fix.fix]++;
      }

      for (const [description, count] of Object.entries(fixMap)) {
        console.log(`   - ${description}: ${count} occorrenze`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 RIEPILOGO:');
    console.log(`   Totale problemi trovati: ${this.issues.length}`);
    console.log(`   Correzioni automatiche: ${this.fixes.length}`);
    console.log(`   Problemi rimanenti: ${this.issues.length - this.fixes.length}`);

    // Problemi critici rimanenti
    const critical = this.issues.filter(i =>
      i.type === 'deprecated' || i.type === 'hook'
    ).length - this.fixes.length;

    if (critical > 0) {
      console.log(`\n⚠️  ATTENZIONE: ${critical} problemi critici richiedono revisione manuale`);
    } else {
      console.log('\n✅ Tutti i problemi critici sono stati risolti!');
    }
  }

  getTypeEmoji(type) {
    const emojis = {
      deprecated: '🚨',
      hook: '🪝',
      todo: '📝',
      console: '🖥️',
      error: '❌'
    };
    return emojis[type] || '⚠️';
  }
}

// Esegui il fixer
async function main() {
  const basePath = path.join(__dirname, '..');
  const fixer = new ProjectFixer(basePath);

  console.log('=' .repeat(60));
  console.log('🔧 BRANCALONIA PROJECT FIXER');
  console.log('=' .repeat(60) + '\n');

  // Scansiona
  await fixer.scanProject();

  // Correggi
  await fixer.fixIssues();

  // Report
  fixer.generateReport();

  // Salva report dettagliato
  const reportPath = path.join(basePath, 'warning-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    issues: fixer.issues,
    fixes: fixer.fixes
  }, null, 2));

  console.log(`\n📄 Report dettagliato salvato in: warning-report.json`);
}

// Esegui
main().catch(console.error);