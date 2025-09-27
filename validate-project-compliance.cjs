#!/usr/bin/env node

/**
 * Script di validazione completa per Brancalonia Project
 * Verifica compliance con Foundry v13 e D&D 5e
 */

const fs = require('fs');
const path = require('path');

// Colori per output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class ProjectValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.successes = [];
        this.stats = {
            totalFiles: 0,
            validFiles: 0,
            invalidFiles: 0,
            missingPacks: [],
            emptyPacks: [],
            moduleErrors: [],
            activeEffects: 0,
            advancements: 0,
            features: 0
        };
    }

    log(message, type = 'info') {
        const prefix = {
            error: `${colors.red}❌`,
            warning: `${colors.yellow}⚠️ `,
            success: `${colors.green}✅`,
            info: `${colors.blue}ℹ️ `,
            header: `${colors.magenta}📊`
        };
        
        console.log(`${prefix[type]} ${message}${colors.reset}`);
        
        if (type === 'error') this.errors.push(message);
        if (type === 'warning') this.warnings.push(message);
        if (type === 'success') this.successes.push(message);
    }

    // 1. Validazione struttura progetto
    validateProjectStructure() {
        this.log('VALIDAZIONE STRUTTURA PROGETTO', 'header');
        
        const requiredDirs = [
            'packs', 'modules', 'styles', 'lang', 'database', 'assets'
        ];
        
        const requiredFiles = [
            'module.json', 'package.json', 'README.md'
        ];
        
        requiredDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.log(`Directory ${dir} presente`, 'success');
            } else {
                this.log(`Directory ${dir} MANCANTE`, 'error');
            }
        });
        
        requiredFiles.forEach(file => {
            if (fs.existsSync(file)) {
                this.log(`File ${file} presente`, 'success');
            } else {
                this.log(`File ${file} MANCANTE`, 'error');
            }
        });
    }

    // 2. Validazione module.json
    validateModuleJson() {
        this.log('\nVALIDAZIONE MODULE.JSON', 'header');
        
        try {
            const moduleJson = JSON.parse(fs.readFileSync('module.json', 'utf8'));
            
            // Campi obbligatori
            const required = ['id', 'title', 'version', 'compatibility', 'packs'];
            required.forEach(field => {
                if (moduleJson[field]) {
                    this.log(`Campo ${field} presente`, 'success');
                } else {
                    this.log(`Campo ${field} MANCANTE`, 'error');
                }
            });
            
            // Validazione compatibility
            if (moduleJson.compatibility) {
                const comp = moduleJson.compatibility;
                if (comp.minimum && comp.verified) {
                    this.log(`Compatibilità: Foundry ${comp.minimum} - ${comp.verified}`, 'success');
                } else {
                    this.log('Compatibility incompleto', 'warning');
                }
            }
            
            // Validazione relationships
            if (moduleJson.relationships?.requires) {
                const dnd5e = moduleJson.relationships.requires.find(r => r.id === 'dnd5e');
                if (dnd5e) {
                    this.log(`Sistema D&D 5e richiesto: ${dnd5e.compatibility?.minimum || 'non specificato'}`, 'success');
                } else {
                    this.log('Sistema D&D 5e non specificato nei requisiti', 'error');
                }
            }
            
            // Conta packs
            if (moduleJson.packs) {
                this.log(`Totale compendi definiti: ${moduleJson.packs.length}`, 'info');
                return moduleJson.packs;
            }
            
        } catch (e) {
            this.log(`Errore parsing module.json: ${e.message}`, 'error');
        }
        
        return [];
    }

    // 3. Validazione compendi
    validatePacks(packDefinitions) {
        this.log('\nVALIDAZIONE COMPENDI', 'header');
        
        packDefinitions.forEach(pack => {
            const packPath = pack.path;
            const sourcePath = `${packPath}/_source`;
            
            // Verifica esistenza directory
            if (!fs.existsSync(packPath)) {
                this.log(`Pack ${pack.name}: directory MANCANTE`, 'error');
                this.stats.missingPacks.push(pack.name);
                return;
            }
            
            // Verifica file sorgente
            if (fs.existsSync(sourcePath)) {
                const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
                if (files.length > 0) {
                    this.log(`Pack ${pack.name}: ${files.length} documenti sorgente`, 'success');
                    this.validatePackContent(pack.name, sourcePath, files, pack.type);
                } else {
                    this.log(`Pack ${pack.name}: nessun file sorgente`, 'warning');
                    this.stats.emptyPacks.push(pack.name);
                }
            } else {
                // Verifica se è compilato come .db
                if (fs.existsSync(`${packPath}.db`)) {
                    this.log(`Pack ${pack.name}: compilato come .db`, 'success');
                } else {
                    this.log(`Pack ${pack.name}: né sorgenti né .db`, 'error');
                    this.stats.emptyPacks.push(pack.name);
                }
            }
        });
    }

    // 4. Validazione contenuto pack
    validatePackContent(packName, sourcePath, files, packType) {
        let validCount = 0;
        let invalidCount = 0;
        
        files.forEach(file => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));
                this.stats.totalFiles++;
                
                // Validazioni base
                if (!content._id) {
                    this.log(`${packName}/${file}: manca _id`, 'error');
                    invalidCount++;
                    return;
                }
                
                if (!content.name) {
                    this.log(`${packName}/${file}: manca name`, 'warning');
                }
                
                // Validazioni specifiche per tipo
                if (packType === 'Item') {
                    this.validateItem(content, packName, file);
                } else if (packType === 'Actor') {
                    this.validateActor(content, packName, file);
                } else if (packType === 'JournalEntry') {
                    this.validateJournal(content, packName, file);
                }
                
                // Conta active effects e advancement
                if (content.effects?.length > 0) {
                    this.stats.activeEffects += content.effects.length;
                }
                
                if (content.system?.advancement?.length > 0) {
                    this.stats.advancements += content.system.advancement.length;
                }
                
                validCount++;
                this.stats.validFiles++;
                
            } catch (e) {
                this.log(`${packName}/${file}: JSON invalido - ${e.message}`, 'error');
                invalidCount++;
                this.stats.invalidFiles++;
            }
        });
        
        if (invalidCount > 0) {
            this.log(`Pack ${packName}: ${invalidCount}/${files.length} file con errori`, 'warning');
        }
    }

    // 5. Validazione Item
    validateItem(item, packName, fileName) {
        // Verifica tipo
        const validTypes = ['weapon', 'equipment', 'consumable', 'tool', 'loot', 
                          'feat', 'spell', 'class', 'subclass', 'background', 'race'];
        
        if (!item.type || !validTypes.includes(item.type)) {
            this.log(`${packName}/${fileName}: tipo non valido (${item.type})`, 'error');
            return;
        }
        
        // Validazioni specifiche per tipo
        switch (item.type) {
            case 'spell':
                if (item.system?.level === undefined) {
                    this.log(`${packName}/${fileName}: spell senza level`, 'error');
                }
                if (!item.system?.school) {
                    this.log(`${packName}/${fileName}: spell senza school`, 'warning');
                }
                break;
                
            case 'class':
                if (!item.system?.hitDice) {
                    this.log(`${packName}/${fileName}: class senza hitDice`, 'error');
                }
                if (!item.system?.levels) {
                    this.log(`${packName}/${fileName}: class senza levels`, 'error');
                }
                break;
                
            case 'feat':
            case 'feature':
                this.stats.features++;
                if (!item.system?.requirements) {
                    // Solo info, non tutti i feat hanno requisiti
                }
                break;
                
            case 'background':
                if (item.system?.startingEquipment && 
                    item.system.startingEquipment.some(e => e.key)) {
                    this.log(`${packName}/${fileName}: background usa 'key' invece di 'uuid'`, 'error');
                }
                break;
        }
        
        // Verifica immagini
        if (item.img && !item.img.startsWith('systems/') && !item.img.startsWith('icons/')) {
            this.log(`${packName}/${fileName}: percorso immagine non standard`, 'warning');
        }
    }

    // 6. Validazione Actor
    validateActor(actor, packName, fileName) {
        if (!actor.type) {
            this.log(`${packName}/${fileName}: actor senza type`, 'error');
            return;
        }
        
        if (actor.type === 'npc') {
            if (!actor.system?.attributes?.hp?.formula) {
                this.log(`${packName}/${fileName}: NPC senza formula HP`, 'warning');
            }
            if (!actor.system?.details?.cr) {
                this.log(`${packName}/${fileName}: NPC senza CR`, 'warning');
            }
        }
    }

    // 7. Validazione Journal
    validateJournal(journal, packName, fileName) {
        if (!journal.pages || journal.pages.length === 0) {
            this.log(`${packName}/${fileName}: journal senza pagine`, 'error');
        }
    }

    // 8. Validazione moduli JavaScript
    validateModules() {
        this.log('\nVALIDAZIONE MODULI JAVASCRIPT', 'header');
        
        const modulesDir = 'modules';
        if (!fs.existsSync(modulesDir)) {
            this.log('Directory modules non trovata', 'error');
            return;
        }
        
        const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
        
        files.forEach(file => {
            const filePath = path.join(modulesDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Controlla pattern deprecati
                if (content.includes('CONFIG.statusEffects.push')) {
                    this.log(`${file}: usa CONFIG.statusEffects.push deprecato`, 'warning');
                }
                
                if (content.includes('renderChatMessage')) {
                    this.log(`${file}: potrebbe usare hook deprecato renderChatMessage`, 'warning');
                }
                
                if (content.includes('.evaluate()') && !content.includes('await')) {
                    this.log(`${file}: potrebbe mancare await su Roll.evaluate()`, 'warning');
                }
                
                // Verifica exports
                if (file.endsWith('.mjs') && !content.includes('export')) {
                    this.log(`${file}: modulo ES senza export`, 'warning');
                }
                
            } catch (e) {
                this.log(`${file}: errore lettura - ${e.message}`, 'error');
                this.stats.moduleErrors.push(file);
            }
        });
        
        this.log(`Moduli JavaScript verificati: ${files.length}`, 'info');
    }

    // 9. Validazione Active Effects
    validateActiveEffects() {
        this.log('\nVALIDAZIONE ACTIVE EFFECTS', 'header');
        
        // Verifica il modulo di applicazione effects
        const effectsModule = 'modules/brancalonia-active-effects-complete.js';
        if (fs.existsSync(effectsModule)) {
            this.log('Modulo Active Effects presente', 'success');
            
            const content = fs.readFileSync(effectsModule, 'utf8');
            if (content.includes('EFFECTS_VERSION')) {
                this.log('Sistema versioning Active Effects implementato', 'success');
            }
            
            // Conta effetti definiti
            const effectMatches = content.match(/effects:\s*\[/g);
            if (effectMatches) {
                this.log(`Definizioni Active Effects trovate: ${effectMatches.length}`, 'info');
            }
        } else {
            this.log('Modulo Active Effects MANCANTE', 'error');
        }
        
        this.log(`Totale Active Effects nei compendi: ${this.stats.activeEffects}`, 'info');
    }

    // 10. Report finale
    generateReport() {
        this.log('\n' + '='.repeat(60), 'header');
        this.log('REPORT COMPLIANCE FINALE', 'header');
        this.log('='.repeat(60), 'header');
        
        console.log(`\n${colors.cyan}📊 STATISTICHE:${colors.reset}`);
        console.log(`   File totali analizzati: ${this.stats.totalFiles}`);
        console.log(`   File validi: ${colors.green}${this.stats.validFiles}${colors.reset}`);
        console.log(`   File con errori: ${colors.red}${this.stats.invalidFiles}${colors.reset}`);
        console.log(`   Active Effects: ${this.stats.activeEffects}`);
        console.log(`   Advancements: ${this.stats.advancements}`);
        console.log(`   Features: ${this.stats.features}`);
        
        console.log(`\n${colors.cyan}📦 STATO COMPENDI:${colors.reset}`);
        if (this.stats.missingPacks.length > 0) {
            console.log(`   Mancanti: ${colors.red}${this.stats.missingPacks.join(', ')}${colors.reset}`);
        }
        if (this.stats.emptyPacks.length > 0) {
            console.log(`   Vuoti: ${colors.yellow}${this.stats.emptyPacks.join(', ')}${colors.reset}`);
        }
        
        console.log(`\n${colors.cyan}✅ SUCCESSI: ${this.successes.length}${colors.reset}`);
        console.log(`${colors.yellow}⚠️  WARNING: ${this.warnings.length}${colors.reset}`);
        console.log(`${colors.red}❌ ERRORI: ${this.errors.length}${colors.reset}`);
        
        // Calcolo compliance score
        const totalChecks = this.successes.length + this.warnings.length + this.errors.length;
        const score = Math.round((this.successes.length / totalChecks) * 100);
        
        console.log(`\n${colors.magenta}🎯 COMPLIANCE SCORE: ${score}%${colors.reset}`);
        
        if (score >= 90) {
            console.log(`${colors.green}✅ PROGETTO ALTAMENTE COMPLIANT${colors.reset}`);
        } else if (score >= 70) {
            console.log(`${colors.yellow}⚠️  PROGETTO PARZIALMENTE COMPLIANT - Richiede ottimizzazioni${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ PROGETTO NON COMPLIANT - Richiede interventi critici${colors.reset}`);
        }
        
        // Salva report dettagliato
        const report = {
            timestamp: new Date().toISOString(),
            score: score,
            stats: this.stats,
            errors: this.errors,
            warnings: this.warnings,
            successes: this.successes
        };
        
        fs.writeFileSync('compliance-report.json', JSON.stringify(report, null, 2));
        console.log(`\n📄 Report dettagliato salvato in: compliance-report.json`);
        
        // Suggerimenti per migliorare
        console.log(`\n${colors.cyan}💡 AZIONI CONSIGLIATE:${colors.reset}`);
        
        if (this.stats.missingPacks.length > 0) {
            console.log('1. Compilare i compendi mancanti con: node compile-with-keys.cjs');
        }
        
        if (this.stats.invalidFiles > 0) {
            console.log('2. Correggere i file JSON con errori');
        }
        
        if (this.warnings.length > 10) {
            console.log('3. Risolvere i warning per migliorare la compatibilità');
        }
        
        if (this.stats.activeEffects < 100) {
            console.log('4. Verificare implementazione Active Effects');
        }
        
        console.log('\n' + '='.repeat(60));
    }

    // Esegui validazione completa
    async run() {
        console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
        console.log(`${colors.magenta}    VALIDAZIONE COMPLIANCE BRANCALONIA v3.21.0${colors.reset}`);
        console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
        
        this.validateProjectStructure();
        const packs = this.validateModuleJson();
        this.validatePacks(packs);
        this.validateModules();
        this.validateActiveEffects();
        
        this.generateReport();
    }
}

// Esegui validazione
const validator = new ProjectValidator();
validator.run();
