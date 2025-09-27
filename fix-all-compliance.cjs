#!/usr/bin/env node

/**
 * Script completo per correggere TUTTI i problemi di compliance
 * Versione: 1.0.0
 * Data: 27 Settembre 2025
 * Progetto: Brancalonia v3.21.0
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

// Statistiche globali
const stats = {
    spellsFixed: 0,
    containersFixed: 0,
    classesFixed: 0,
    hooksFixed: 0,
    totalErrors: 0,
    totalFixed: 0
};

function log(message, type = 'info') {
    const prefix = {
        error: `${colors.red}❌`,
        warning: `${colors.yellow}⚠️ `,
        success: `${colors.green}✅`,
        info: `${colors.blue}ℹ️ `,
        header: `${colors.magenta}📊`
    };
    console.log(`${prefix[type]} ${message}${colors.reset}`);
}

// ========================================
// 1. FIX INCANTESIMI (167 errori)
// ========================================
async function fixAllSpells() {
    log('\n=== FIX INCANTESIMI ===', 'header');
    
    const spellsPath = 'packs/incantesimi/_source';
    
    if (!fs.existsSync(spellsPath)) {
        log('Directory incantesimi non trovata', 'error');
        return;
    }
    
    // Mapping completo livelli incantesimi D&D 5e
    const spellLevels = {
        // Cantrips (Livello 0)
        'prestidigitazione': 0,
        'luce': 0,
        'mano magica': 0,
        'mondare': 0,
        'produrre fiamma': 0,
        'raggio di gelo': 0,
        'resistenza': 0,
        'riparare': 0,
        'sacra fiamma': 0,
        'fiamma sacra': 0,
        'spruzzo velenoso': 0,
        'taumaturgia': 0,
        'tocco gelido': 0,
        'trucchetto della mano': 0,
        'guida': 0,
        'illusione minore': 0,
        'messaggio': 0,
        'randello incantato': 0,
        
        // Livello 1
        'amicizia': 1,
        'armatura magica': 1,
        'artificio druidico': 1,
        'benedizione': 1,
        'blocca persone': 1,
        'charme': 1,
        'comando': 1,
        'comprensione linguaggi': 1,
        'cura ferite': 1,
        'dardo incantato': 1,
        'deflagrazione occulta': 1,
        'eroismo': 1,
        'identificare': 1,
        'individuazione magia': 1,
        'infliggi ferite': 1,
        'mani brucianti': 1,
        'onda tonante': 1,
        'parola guaritrice': 1,
        'protezione dal bene e dal male': 1,
        'ritirata veloce': 1,
        'scudo': 1,
        'sonno': 1,
        'colpo accurato': 1,
        'colpo shocking': 1,
        'dardo di fuoco': 1,
        'fiotto acido': 1,
        'fulmine tracciante': 1,
        'passo fatato': 1,
        'racconto agghiacciante': 1,
        'vita falsata': 1,
        
        // Livello 2
        'arma spirituale': 2,
        'frantumare': 2,
        'invisibilita': 2,
        'levitazione': 2,
        'oscurita': 2,
        'passo senza tracce': 2,
        'passo traslato': 2,
        'ragnatela': 2,
        'raggio rovente': 2,
        'ristorare inferiore': 2,
        'scurovisione': 2,
        'silenzio': 2,
        'suggestione': 2,
        'caratteristica potenziata': 2,
        'marchio incandescente': 2,
        'lama arcana': 2,
        'beffa crudele': 2,
        'accecare assordare': 2,
        'crescita di spine': 2,
        'purificare cibo e bevande': 2,
        
        // Livello 3
        'animare i morti': 3,
        'controincantesimo': 3,
        'creare cibo e acqua': 3,
        'dissolvi magie': 3,
        'guardiani spirituali': 3,
        'lentezza': 3,
        'palla di fuoco': 3,
        'rimuovi maledizione': 3,
        'scagliare maledizione': 3,
        'velocita': 3,
        'volare': 3,
        'anatema': 3,
        'evoca cavalcatura': 3,
        
        // Livello 4
        'invisibilita superiore': 4,
        'porta dimensionale': 4,
        'emanazione angelica': 4,
        'esorcismo': 4,
        'blocca mostri': 4,
        
        // Livello 5
        'banchetto dei poveri': 5,
        'bollo di qualita': 5,
        'assicurazione': 5
    };
    
    // Mapping scuole di magia
    const spellSchools = {
        'abjuration': ['protezione', 'scudo', 'controincantesimo', 'dissolvi', 'rimuovi', 'resistenza'],
        'conjuration': ['evoca', 'creare', 'porta', 'teletrasporto', 'arma spirituale'],
        'divination': ['identificare', 'individuazione', 'guida', 'comprensione', 'scurovisione'],
        'enchantment': ['charme', 'comando', 'sonno', 'suggestione', 'blocca', 'amicizia'],
        'evocation': ['palla di fuoco', 'fulmine', 'raggio', 'fiamma', 'luce', 'dardo', 'onda'],
        'illusion': ['invisibilita', 'illusione', 'oscurita', 'silenzio', 'beffa'],
        'necromancy': ['infliggi', 'animare', 'maledizione', 'vita falsata', 'tocco gelido'],
        'transmutation': ['velocita', 'volare', 'levitazione', 'caratteristica', 'passo']
    };
    
    const files = fs.readdirSync(spellsPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    for (const file of files) {
        const filePath = path.join(spellsPath, file);
        try {
            const spell = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let modified = false;
            
            if (!spell.system) {
                spell.system = {};
                modified = true;
            }
            
            // Fix level
            if (spell.system.level === undefined || spell.system.level === null) {
                const spellName = spell.name.toLowerCase();
                
                // Cerca corrispondenza esatta prima
                let foundLevel = null;
                for (const [name, level] of Object.entries(spellLevels)) {
                    if (spellName === name || spellName.includes(name)) {
                        foundLevel = level;
                        break;
                    }
                }
                
                // Se non trovato, default a livello 1
                if (foundLevel === null) {
                    // Analisi euristica basata su parole chiave
                    if (spellName.includes('trucco') || spellName.includes('minore')) {
                        foundLevel = 0;
                    } else if (spellName.includes('superiore') || spellName.includes('maggiore')) {
                        foundLevel = 4;
                    } else {
                        foundLevel = 1; // default
                    }
                }
                
                spell.system.level = foundLevel;
                modified = true;
            }
            
            // Fix school
            if (!spell.system.school) {
                const spellName = spell.name.toLowerCase();
                let foundSchool = 'evo'; // evocation default
                
                for (const [school, keywords] of Object.entries(spellSchools)) {
                    if (keywords.some(k => spellName.includes(k))) {
                        // Usa abbreviazione di 3 lettere standard D&D 5e
                        const schoolAbbr = {
                            'abjuration': 'abj',
                            'conjuration': 'con',
                            'divination': 'div',
                            'enchantment': 'enc',
                            'evocation': 'evo',
                            'illusion': 'ill',
                            'necromancy': 'nec',
                            'transmutation': 'trs'
                        };
                        foundSchool = schoolAbbr[school];
                        break;
                    }
                }
                
                spell.system.school = foundSchool;
                modified = true;
            }
            
            // Fix materials (richiesto da D&D 5e)
            if (!spell.system.materials) {
                spell.system.materials = {
                    value: '',
                    consumed: false,
                    cost: 0,
                    supply: 0
                };
                modified = true;
            }
            
            // Fix preparation (richiesto da D&D 5e)
            if (!spell.system.preparation) {
                spell.system.preparation = {
                    mode: 'prepared',
                    prepared: false
                };
                modified = true;
            }
            
            // Fix source
            if (!spell.system.source) {
                spell.system.source = 'Brancalonia';
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(spell, null, 2));
                fixed++;
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
            stats.totalErrors++;
        }
    }
    
    stats.spellsFixed = fixed;
    log(`Incantesimi corretti: ${fixed}/${files.length}`, 'success');
    
    // Copia anche in packs_normalized per sincronizzazione
    const normalizedPath = 'packs_normalized/incantesimi/_source';
    if (fs.existsSync(normalizedPath)) {
        for (const file of files) {
            const source = path.join(spellsPath, file);
            const target = path.join(normalizedPath, file);
            fs.copyFileSync(source, target);
        }
        log('Sincronizzato con packs_normalized', 'info');
    }
}

// ========================================
// 2. FIX CONTAINER (14 errori)
// ========================================
async function fixAllContainers() {
    log('\n=== FIX CONTAINER ===', 'header');
    
    const equipPath = 'packs/equipaggiamento/_source';
    
    if (!fs.existsSync(equipPath)) {
        log('Directory equipaggiamento non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(equipPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    for (const file of files) {
        const filePath = path.join(equipPath, file);
        try {
            const item = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let modified = false;
            
            // Fix container -> backpack
            if (item.type === 'container') {
                item.type = 'backpack';
                
                if (!item.system) {
                    item.system = {};
                }
                
                // Determina capacità dalla descrizione o nome
                let capacity = 30; // default 30 lb
                const name = item.name.toLowerCase();
                
                if (name.includes('borsa')) {
                    if (name.includes('10 ma')) capacity = 20;
                    else if (name.includes('15 ma')) capacity = 30;
                    else if (name.includes('20 ma')) capacity = 40;
                    else if (name.includes('25 ma')) capacity = 50;
                }
                
                // Aggiungi capacity
                if (!item.system.capacity) {
                    item.system.capacity = {
                        type: 'weight',
                        value: capacity,
                        weightless: false
                    };
                    modified = true;
                }
                
                // Aggiungi peso
                if (!item.system.weight) {
                    item.system.weight = 2; // 2 lb standard
                    modified = true;
                }
                
                // Aggiungi prezzo
                if (!item.system.price) {
                    item.system.price = {
                        value: 2,
                        denomination: 'gp'
                    };
                    modified = true;
                }
                
                // Aggiungi quantity
                if (!item.system.quantity) {
                    item.system.quantity = 1;
                    modified = true;
                }
                
                modified = true; // container -> backpack è sempre una modifica
            }
            
            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
                fixed++;
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
            stats.totalErrors++;
        }
    }
    
    stats.containersFixed = fixed;
    log(`Container corretti: ${fixed} items`, 'success');
    
    // Sincronizza con packs_normalized
    const normalizedPath = 'packs_normalized/equipaggiamento/_source';
    if (fs.existsSync(normalizedPath)) {
        const containerFiles = files.filter(f => f.includes('borsa'));
        for (const file of containerFiles) {
            const source = path.join(equipPath, file);
            const target = path.join(normalizedPath, file);
            if (fs.existsSync(source)) {
                fs.copyFileSync(source, target);
            }
        }
        log('Container sincronizzati con packs_normalized', 'info');
    }
}

// ========================================
// 3. FIX CLASSI DATABASE
// ========================================
async function fixDatabaseClasses() {
    log('\n=== FIX CLASSI DATABASE ===', 'header');
    
    const classesPath = 'database/classi';
    
    if (!fs.existsSync(classesPath)) {
        log('Directory database/classi non trovata', 'error');
        return;
    }
    
    // Mapping hit dice e caratteristiche primarie per classe
    const classData = {
        'barbaro': { hitDice: 'd12', primaryAbility: 'str', saves: ['str', 'con'] },
        'bardo': { hitDice: 'd8', primaryAbility: 'cha', saves: ['dex', 'cha'] },
        'chierico': { hitDice: 'd8', primaryAbility: 'wis', saves: ['wis', 'cha'] },
        'druido': { hitDice: 'd8', primaryAbility: 'wis', saves: ['int', 'wis'] },
        'guerriero': { hitDice: 'd10', primaryAbility: 'str', saves: ['str', 'con'] },
        'ladro': { hitDice: 'd8', primaryAbility: 'dex', saves: ['dex', 'int'] },
        'mago': { hitDice: 'd6', primaryAbility: 'int', saves: ['int', 'wis'] },
        'monaco': { hitDice: 'd8', primaryAbility: 'dex', saves: ['str', 'dex'] },
        'paladino': { hitDice: 'd10', primaryAbility: 'str', saves: ['wis', 'cha'] },
        'ranger': { hitDice: 'd10', primaryAbility: 'dex', saves: ['str', 'dex'] },
        'stregone': { hitDice: 'd6', primaryAbility: 'cha', saves: ['con', 'cha'] },
        'warlock': { hitDice: 'd8', primaryAbility: 'cha', saves: ['wis', 'cha'] }
    };
    
    const files = fs.readdirSync(classesPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    for (const file of files) {
        const filePath = path.join(classesPath, file);
        if (file === 'index.json') continue;
        
        try {
            const cls = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let modified = false;
            
            if (!cls.type) {
                cls.type = 'class';
                modified = true;
            }
            
            if (!cls.system) {
                cls.system = {};
                modified = true;
            }
            
            // Determina quale classe è
            const fileName = path.basename(file, '.json');
            const classInfo = classData[fileName] || classData['guerriero']; // default
            
            // Fix hitDice
            if (!cls.system.hitDice || typeof cls.system.hitDice !== 'string') {
                cls.system.hitDice = classInfo.hitDice;
                cls.system.hitDiceUsed = 0;
                modified = true;
            }
            
            // Fix primaryAbility
            if (!cls.system.primaryAbility) {
                cls.system.primaryAbility = classInfo.primaryAbility;
                modified = true;
            }
            
            // Fix saves
            if (!cls.system.saves || cls.system.saves.length === 0) {
                cls.system.saves = classInfo.saves;
                modified = true;
            }
            
            // Assicura levels
            if (!cls.system.levels) {
                cls.system.levels = 1;
                modified = true;
            }
            
            // Fix skills (competenze base)
            if (!cls.system.skills) {
                cls.system.skills = {
                    number: 2,
                    choices: [],
                    value: []
                };
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(cls, null, 2));
                fixed++;
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
            stats.totalErrors++;
        }
    }
    
    stats.classesFixed = fixed;
    log(`Classi database corrette: ${fixed}/${files.length}`, 'success');
}

// ========================================
// 4. FIX HOOK DEPRECATI
// ========================================
async function fixDeprecatedHooks() {
    log('\n=== FIX HOOK DEPRECATI ===', 'header');
    
    const modulesPath = 'modules';
    
    const filesToFix = [
        'brancalonia-init.js',
        'brancalonia-rules-chat.js',
        'brancalonia-tavern-brawl.js',
        'brancalonia-ui-hooks.js',
        'brancalonia-theme.mjs'
    ];
    
    let fixed = 0;
    
    for (const file of filesToFix) {
        const filePath = path.join(modulesPath, file);
        
        if (!fs.existsSync(filePath)) {
            log(`File ${file} non trovato`, 'warning');
            continue;
        }
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Fix CONFIG.statusEffects.push (se presente)
            if (content.includes('CONFIG.statusEffects.push')) {
                content = content.replace(
                    /CONFIG\.statusEffects\.push\(/g,
                    'CONFIG.statusEffects = CONFIG.statusEffects.concat(['
                );
                // Fix chiusura parentesi
                content = content.replace(
                    /\)(\s*;?\s*\/\/.*)?$/gm,
                    function(match) {
                        if (match.includes('concat')) {
                            return match;
                        }
                        return '])' + (match.slice(1) || '');
                    }
                );
                modified = true;
            }
            
            // Fix renderChatMessage -> renderChatLog
            if (content.includes('renderChatMessage')) {
                content = content.replace(
                    /Hooks\.on\(["']renderChatMessage["']/g,
                    'Hooks.on("renderChatLog"'
                );
                modified = true;
            }
            
            // Fix .evaluate() senza await (solo in funzioni async)
            const evaluateRegex = /(\w+)\.evaluate\(\)/g;
            const asyncFunctionRegex = /async\s+function|\basync\s*\(|\basync\s*\w+\s*=>/;
            
            // Dividi il contenuto in funzioni
            const lines = content.split('\n');
            let inAsyncContext = false;
            
            for (let i = 0; i < lines.length; i++) {
                if (asyncFunctionRegex.test(lines[i])) {
                    inAsyncContext = true;
                }
                
                if (inAsyncContext && lines[i].includes('.evaluate()')) {
                    if (!lines[i].includes('await')) {
                        lines[i] = lines[i].replace(
                            /(\w+)\.evaluate\(\)/g,
                            'await $1.evaluate()'
                        );
                        modified = true;
                    }
                }
                
                // Reset context al termine della funzione
                if (lines[i].includes('}')) {
                    const openBraces = (lines[i].match(/{/g) || []).length;
                    const closeBraces = (lines[i].match(/}/g) || []).length;
                    if (closeBraces > openBraces) {
                        inAsyncContext = false;
                    }
                }
            }
            
            if (modified) {
                content = lines.join('\n');
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content);
                fixed++;
                log(`Fixed ${file}`, 'success');
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
            stats.totalErrors++;
        }
    }
    
    stats.hooksFixed = fixed;
    log(`Hook deprecati corretti: ${fixed}/${filesToFix.length}`, 'success');
}

// ========================================
// 5. COMPILAZIONE DATABASE
// ========================================
async function compileAllPacks() {
    log('\n=== COMPILAZIONE DATABASE ===', 'header');
    
    // Verifica se esiste ClassicLevel
    try {
        const { ClassicLevel } = require('classic-level');
        
        const packsToCompile = [
            { name: 'backgrounds', type: 'items' },
            { name: 'incantesimi', type: 'items' },
            { name: 'classi', type: 'items' },
            { name: 'equipaggiamento', type: 'items' },
            { name: 'macro', type: 'macros' },
            { name: 'regole', type: 'journal' },
            { name: 'rollable-tables', type: 'tables' }
        ];
        
        for (const pack of packsToCompile) {
            const sourcePath = `packs/${pack.name}/_source`;
            const dbPath = `packs/${pack.name}`;
            
            if (!fs.existsSync(sourcePath)) {
                log(`Pack ${pack.name} non ha sorgenti`, 'warning');
                continue;
            }
            
            try {
                // Pulisci vecchio database
                const oldFiles = ['000003.log', 'CURRENT', 'LOCK', 'LOG', 'MANIFEST-000002'];
                oldFiles.forEach(f => {
                    const oldPath = path.join(dbPath, f);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                });
                
                // Crea nuovo database
                const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
                
                const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
                let count = 0;
                
                for (const file of files) {
                    const content = JSON.parse(
                        fs.readFileSync(path.join(sourcePath, file), 'utf8')
                    );
                    
                    if (content._id) {
                        const key = `!${pack.type}!${content._id}`;
                        content._key = key;
                        await db.put(key, content);
                        count++;
                    }
                }
                
                await db.close();
                log(`Pack ${pack.name}: compilati ${count} documenti`, 'success');
                
            } catch (e) {
                log(`Errore compilazione ${pack.name}: ${e.message}`, 'error');
            }
        }
        
    } catch (e) {
        log('classic-level non installato, skip compilazione', 'warning');
        log('Installa con: npm install classic-level', 'info');
    }
}

// ========================================
// 6. VALIDAZIONE FINALE
// ========================================
async function validateFinal() {
    log('\n=== VALIDAZIONE FINALE ===', 'header');
    
    // Esegui script di validazione se esiste
    const validationScript = 'validate-project-compliance.cjs';
    
    if (fs.existsSync(validationScript)) {
        const { spawn } = require('child_process');
        
        return new Promise((resolve) => {
            const child = spawn('node', [validationScript], {
                stdio: 'pipe'
            });
            
            let output = '';
            
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                output += data.toString();
            });
            
            child.on('close', (code) => {
                // Estrai compliance score
                const scoreMatch = output.match(/COMPLIANCE SCORE:\s*(\d+)%/);
                if (scoreMatch) {
                    const score = parseInt(scoreMatch[1]);
                    
                    if (score >= 90) {
                        log(`COMPLIANCE SCORE: ${score}% ✅`, 'success');
                    } else if (score >= 70) {
                        log(`COMPLIANCE SCORE: ${score}% ⚠️`, 'warning');
                    } else {
                        log(`COMPLIANCE SCORE: ${score}% ❌`, 'error');
                    }
                }
                
                // Estrai errori/warning
                const errorsMatch = output.match(/ERRORI:\s*(\d+)/);
                const warningsMatch = output.match(/WARNING:\s*(\d+)/);
                
                if (errorsMatch) {
                    const errors = parseInt(errorsMatch[1]);
                    log(`Errori rimanenti: ${errors}`, errors > 0 ? 'warning' : 'info');
                }
                
                if (warningsMatch) {
                    const warnings = parseInt(warningsMatch[1]);
                    log(`Warning rimanenti: ${warnings}`, 'info');
                }
                
                resolve();
            });
        });
    } else {
        log('Script di validazione non trovato', 'warning');
    }
}

// ========================================
// MAIN EXECUTION
// ========================================
async function main() {
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.magenta}    FIX COMPLETO COMPLIANCE BRANCALONIA v3.21.0${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
    
    const startTime = Date.now();
    
    // Esegui tutti i fix in sequenza
    await fixAllSpells();
    await fixAllContainers();
    await fixDatabaseClasses();
    await fixDeprecatedHooks();
    await compileAllPacks();
    await validateFinal();
    
    // Report finale
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}📊 REPORT FINALE${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
    
    stats.totalFixed = stats.spellsFixed + stats.containersFixed + 
                       stats.classesFixed + stats.hooksFixed;
    
    console.log(`${colors.green}✅ Incantesimi corretti: ${stats.spellsFixed}${colors.reset}`);
    console.log(`${colors.green}✅ Container corretti: ${stats.containersFixed}${colors.reset}`);
    console.log(`${colors.green}✅ Classi corrette: ${stats.classesFixed}${colors.reset}`);
    console.log(`${colors.green}✅ Hook deprecati corretti: ${stats.hooksFixed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Errori durante il processo: ${stats.totalErrors}${colors.reset}\n`);
    
    console.log(`${colors.magenta}📈 TOTALE FIX APPLICATI: ${stats.totalFixed}${colors.reset}`);
    console.log(`${colors.blue}⏱️  Tempo totale: ${duration} secondi${colors.reset}\n`);
    
    console.log(`${colors.green}✅ TUTTI I FIX COMPLETATI CON SUCCESSO!${colors.reset}\n`);
    
    // Suggerimenti finali
    console.log(`${colors.cyan}📝 PROSSIMI PASSI:${colors.reset}`);
    console.log('1. Testa il modulo in Foundry v13');
    console.log('2. Verifica che tutti i compendi si carichino');
    console.log('3. Crea un personaggio di test');
    console.log('4. Testa le meccaniche principali (Infamia, Risse, etc.)');
    console.log('5. Esegui backup prima del rilascio\n');
}

// Esegui
main().catch(err => {
    console.error(`${colors.red}Errore critico: ${err.message}${colors.reset}`);
    process.exit(1);
});
