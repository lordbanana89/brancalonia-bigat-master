#!/usr/bin/env node
/**
 * Verifica finale dell'integrità del progetto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectVerifier {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.basePath = path.join(__dirname, '..');
  }

  // Verifica file mancanti referenziati
  checkMissingFiles() {
    console.log('📁 Verifica file mancanti...\n');

    // Controlla manifest
    const manifestPath = path.join(this.basePath, 'module.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Scripts
      if (manifest.scripts) {
        for (const script of manifest.scripts) {
          const scriptPath = path.join(this.basePath, script);
          if (!fs.existsSync(scriptPath)) {
            this.issues.push(`❌ Script mancante: ${script}`);
          }
        }
      }

      // Styles
      if (manifest.styles) {
        for (const style of manifest.styles) {
          const stylePath = path.join(this.basePath, style);
          if (!fs.existsSync(stylePath)) {
            this.issues.push(`❌ Style mancante: ${style}`);
          }
        }
      }

      // ESModules
      if (manifest.esmodules) {
        for (const module of manifest.esmodules) {
          const modulePath = path.join(this.basePath, module);
          if (!fs.existsSync(modulePath)) {
            this.issues.push(`❌ ESModule mancante: ${module}`);
          }
        }
      }
    }

    // Controlla index.json per file referenziati
    const indexFiles = this.findFiles(path.join(this.basePath, 'database'), ['.json'], 'index.json');

    for (const indexPath of indexFiles) {
      try {
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const dir = path.dirname(indexPath);

        if (indexData.elementi) {
          for (const elem of indexData.elementi) {
            if (elem.file) {
              const filePath = path.join(dir, elem.file);
              if (!fs.existsSync(filePath)) {
                const relativePath = path.relative(this.basePath, filePath);
                this.warnings.push(`⚠️  File referenziato mancante: ${relativePath}`);
              }
            }
          }
        }
      } catch (e) {
        // Skip
      }
    }
  }

  // Verifica deprecazioni rimanenti
  checkDeprecations() {
    console.log('🚨 Verifica deprecazioni...\n');

    const jsFiles = this.findFiles(path.join(this.basePath, 'modules'), ['.js', '.mjs']);

    const deprecatedPatterns = [
      { pattern: /game\.actors\.entities/g, name: 'game.actors.entities' },
      { pattern: /game\.items\.entities/g, name: 'game.items.entities' },
      { pattern: /actor\.data\.data/g, name: 'actor.data.data' },
      { pattern: /item\.data\.data/g, name: 'item.data.data' },
      { pattern: /CONFIG\.\w+\.entityClass/g, name: 'CONFIG.*.entityClass' },
      { pattern: /renderActorSheetV2/g, name: 'renderActorSheetV2' },
      { pattern: /renderItemSheetV2/g, name: 'renderItemSheetV2' }
    ];

    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.basePath, file);

        for (const dep of deprecatedPatterns) {
          if (dep.pattern.test(content)) {
            this.issues.push(`❌ Deprecazione: ${dep.name} in ${relativePath}`);
          }
          dep.pattern.lastIndex = 0;
        }
      } catch (e) {
        // Skip
      }
    }
  }

  // Verifica integrità database
  checkDatabaseIntegrity() {
    console.log('🗄️ Verifica integrità database...\n');

    const dbPath = path.join(this.basePath, 'database');
    const categories = fs.readdirSync(dbPath).filter(f =>
      fs.statSync(path.join(dbPath, f)).isDirectory()
    );

    for (const category of categories) {
      const categoryPath = path.join(dbPath, category);
      const indexPath = path.join(categoryPath, 'index.json');

      if (!fs.existsSync(indexPath)) {
        this.warnings.push(`⚠️  Index mancante: ${category}/index.json`);
        continue;
      }

      try {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

        // Verifica struttura standard
        if (!index.categoria || !index.elementi || typeof index.totale === 'undefined') {
          this.warnings.push(`⚠️  Struttura non standard: ${category}/index.json`);
        }

        // Verifica conteggio
        if (index.elementi && index.totale !== index.elementi.length) {
          this.warnings.push(`⚠️  Conteggio errato in ${category}/index.json: dichiarati ${index.totale}, trovati ${index.elementi.length}`);
        }
      } catch (e) {
        this.issues.push(`❌ JSON invalido: ${category}/index.json`);
      }
    }
  }

  // Verifica packs compilati
  checkPacksIntegrity() {
    console.log('📦 Verifica packs LevelDB...\n');

    const packsPath = path.join(this.basePath, 'packs');

    if (!fs.existsSync(packsPath)) {
      this.issues.push('❌ Directory packs mancante');
      return;
    }

    const packs = fs.readdirSync(packsPath).filter(f =>
      fs.statSync(path.join(packsPath, f)).isDirectory()
    );

    for (const pack of packs) {
      const packPath = path.join(packsPath, pack);
      const sourcePath = path.join(packPath, '_source');
      const dbFiles = fs.readdirSync(packPath).filter(f => f.endsWith('.db'));

      // Verifica presenza database LevelDB
      if (dbFiles.length === 0) {
        this.warnings.push(`⚠️  Pack non compilato: ${pack}`);
      }

      // Verifica presenza source
      if (!fs.existsSync(sourcePath)) {
        this.warnings.push(`⚠️  Source mancante per pack: ${pack}`);
      } else {
        // Verifica che i source abbiano _key field
        const sourceFiles = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

        for (const sourceFile of sourceFiles.slice(0, 3)) { // Check solo primi 3 per efficienza
          try {
            const data = JSON.parse(fs.readFileSync(path.join(sourcePath, sourceFile), 'utf8'));
            if (!data._key) {
              this.warnings.push(`⚠️  _key mancante in ${pack}/_source/${sourceFile}`);
              break;
            }
          } catch (e) {
            this.issues.push(`❌ JSON invalido: ${pack}/_source/${sourceFile}`);
          }
        }
      }
    }
  }

  // Trova file
  findFiles(dir, extensions, nameFilter = null) {
    let results = [];

    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          results = results.concat(this.findFiles(filePath, extensions, nameFilter));
        } else if (extensions.some(ext => file.endsWith(ext))) {
          if (!nameFilter || file === nameFilter) {
            results.push(filePath);
          }
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }

    return results;
  }

  // Report finale
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORT VERIFICA INTEGRITÀ');
    console.log('='.repeat(60) + '\n');

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ PERFETTO! Nessun problema critico trovato.\n');
      console.log('Il progetto è pronto per Foundry V13+');
      return;
    }

    if (this.issues.length > 0) {
      console.log(`❌ PROBLEMI CRITICI (${this.issues.length}):\n`);
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNING (${this.warnings.length}):\n`);
      // Mostra solo primi 10 warning
      this.warnings.slice(0, 10).forEach(warning => console.log(`   ${warning}`));
      if (this.warnings.length > 10) {
        console.log(`   ... e altri ${this.warnings.length - 10} warning`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 RIEPILOGO:');
    console.log(`   Problemi critici: ${this.issues.length}`);
    console.log(`   Warning: ${this.warnings.length}`);
    console.log(`   Stato: ${this.issues.length === 0 ? '✅ Operativo' : '⚠️ Richiede attenzione'}`);
  }

  run() {
    console.log('='.repeat(60));
    console.log('🔍 VERIFICA INTEGRITÀ PROGETTO BRANCALONIA');
    console.log('='.repeat(60) + '\n');

    this.checkMissingFiles();
    this.checkDeprecations();
    this.checkDatabaseIntegrity();
    this.checkPacksIntegrity();
    this.generateReport();
  }
}

// Esegui
const verifier = new ProjectVerifier();
verifier.run();