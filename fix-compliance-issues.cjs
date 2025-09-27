#!/usr/bin/env node

/**
 * Script per correggere automaticamente i problemi di compliance
 * identificati nel progetto Brancalonia
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
    magenta: '\x1b[35m'
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

// 1. Fix incantesimi senza level
async function fixSpells() {
    log('FIX INCANTESIMI', 'header');
    
    const spellsPath = 'packs_normalized/incantesimi/_source';
    
    if (!fs.existsSync(spellsPath)) {
        log('Directory incantesimi non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(spellsPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    // Mappa per determinare livello dall'nome o descrizione
    const levelMap = {
        // Cantrips (level 0)
        'prestidigitazione': 0,
        'luce': 0,
        'mano-magica': 0,
        'mondare': 0,
        'produrre-fiamma': 0,
        'raggio-di-gelo': 0,
        'resistenza': 0,
        'riparare': 0,
        'sacra-fiamma': 0,
        'spruzzo-velenoso': 0,
        'taumaturgia': 0,
        'tocco-gelido': 0,
        'trucchetto': 0,
        'fiamma-sacra': 0,
        'guida': 0,
        'illusione-minore': 0,
        'messaggio': 0,
        'randello-incantato': 0,
        
        // Level 1
        'amicizia': 1,
        'armatura-magica': 1,
        'artificio-druidico': 1,
        'benedizione': 1,
        'blocca-persone': 1,
        'charme': 1,
        'comando': 1,
        'comprensione-linguaggi': 1,
        'cura-ferite': 1,
        'dardo-incantato': 1,
        'deflagrazione-occulta': 1,
        'eroismo': 1,
        'identificare': 1,
        'individuazione-magia': 1,
        'infliggi-ferite': 1,
        'mani-brucianti': 1,
        'onda-tonante': 1,
        'parola-guaritrice': 1,
        'protezione': 1,
        'ritirata-veloce': 1,
        'scudo': 1,
        'sonno': 1,
        'colpo-accurato': 1,
        'colpo-shocking': 1,
        'dardo-di-fuoco': 1,
        'fiotto-acido': 1,
        'fulmine-tracciante': 1,
        'passo-fatato': 1,
        'racconto-agghiacciante': 1,
        'vita-falsata': 1,
        
        // Level 2
        'arma-spirituale': 2,
        'blocca-mostri': 2,
        'frantumare': 2,
        'invisibilita': 2,
        'levitazione': 2,
        'oscurita': 2,
        'passo-senza-tracce': 2,
        'passo-traslato': 2,
        'ragnatela': 2,
        'raggio-rovente': 2,
        'ristorare-inferiore': 2,
        'scurovisione': 2,
        'silenzio': 2,
        'suggestione': 2,
        'caratteristica-potenziata': 2,
        'marchio-incandescente': 2,
        'lama-arcana': 2,
        'beffa-crudele': 2,
        'accecare': 2,
        'assordare': 2,
        'crescita-di-spine': 2,
        'purificare-cibo': 2,
        
        // Level 3
        'animare-i-morti': 3,
        'controincantesimo': 3,
        'creare-cibo': 3,
        'dissolvi-magie': 3,
        'guardiani-spirituali': 3,
        'lentezza': 3,
        'palla-di-fuoco': 3,
        'rimuovi-maledizione': 3,
        'scagliare-maledizione': 3,
        'velocita': 3,
        'volare': 3,
        'anatema': 3,
        'evoca-cavalcatura': 3,
        
        // Level 4
        'invisibilita-superiore': 4,
        'porta-dimensionale': 4,
        'emanazione-angelica': 4,
        'esorcismo': 4,
        
        // Level 5
        'banchetto-dei-poveri': 5,
        'bollo-di-qualita': 5,
        'assicurazione': 5
    };
    
    // Mappa scuole di magia
    const schoolMap = {
        'abjuration': ['protezione', 'scudo', 'controincantesimo', 'dissolvi', 'rimuovi'],
        'conjuration': ['evoca', 'creare', 'porta-dimensionale', 'teletrasporto'],
        'divination': ['identificare', 'individuazione', 'guida', 'comprensione'],
        'enchantment': ['charme', 'comando', 'sonno', 'suggestione', 'blocca'],
        'evocation': ['palla-di-fuoco', 'fulmine', 'raggio', 'fiamma', 'luce'],
        'illusion': ['invisibilita', 'illusione', 'oscurita', 'silenzio'],
        'necromancy': ['infliggi', 'animare', 'maledizione', 'vita-falsata'],
        'transmutation': ['velocita', 'volare', 'levitazione', 'caratteristica']
    };
    
    files.forEach(file => {
        const filePath = path.join(spellsPath, file);
        try {
            const spell = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (!spell.system) {
                spell.system = {};
            }
            
            // Determina level se mancante
            if (spell.system.level === undefined || spell.system.level === null) {
                const nameLower = spell.name.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/'/g, '');
                
                // Cerca nel mapping
                let foundLevel = 0;
                for (const [pattern, level] of Object.entries(levelMap)) {
                    if (nameLower.includes(pattern)) {
                        foundLevel = level;
                        break;
                    }
                }
                
                spell.system.level = foundLevel;
                fixed++;
            }
            
            // Aggiungi school se mancante
            if (!spell.system.school) {
                const nameLower = spell.name.toLowerCase();
                let foundSchool = 'evocation'; // default
                
                for (const [school, patterns] of Object.entries(schoolMap)) {
                    if (patterns.some(p => nameLower.includes(p))) {
                        foundSchool = school.substring(0, 3); // abbreviazione 3 lettere
                        break;
                    }
                }
                
                spell.system.school = foundSchool;
            }
            
            // Aggiungi campi mancanti per spell
            if (!spell.system.materials) {
                spell.system.materials = {
                    value: '',
                    consumed: false,
                    cost: 0,
                    supply: 0
                };
            }
            
            if (!spell.system.preparation) {
                spell.system.preparation = {
                    mode: 'prepared',
                    prepared: false
                };
            }
            
            fs.writeFileSync(filePath, JSON.stringify(spell, null, 2));
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    });
    
    log(`Incantesimi corretti: ${fixed}/${files.length}`, 'success');
}

// 2. Fix classi senza hitDice
async function fixClasses() {
    log('\nFIX CLASSI', 'header');
    
    const classesPath = 'packs_normalized/classi/_source';
    
    if (!fs.existsSync(classesPath)) {
        log('Directory classi non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(classesPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    // Mappa hit dice per classe
    const hitDiceMap = {
        'barbaro': 12,
        'bardo': 8,
        'chierico': 8,
        'druido': 8,
        'guerriero': 10,
        'ladro': 8,
        'mago': 6,
        'monaco': 8,
        'paladino': 10,
        'ranger': 10,
        'stregone': 6,
        'warlock': 8
    };
    
    files.forEach(file => {
        const filePath = path.join(classesPath, file);
        try {
            const cls = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (!cls.system) {
                cls.system = {};
            }
            
            // Fix hitDice
            if (!cls.system.hitDice || typeof cls.system.hitDice === 'string') {
                const className = cls.name.toLowerCase();
                let dice = 8; // default
                
                for (const [name, value] of Object.entries(hitDiceMap)) {
                    if (className.includes(name)) {
                        dice = value;
                        break;
                    }
                }
                
                cls.system.hitDice = `d${dice}`;
                cls.system.hitDiceUsed = 0;
                fixed++;
            }
            
            // Aggiungi levels se mancante
            if (!cls.system.levels) {
                cls.system.levels = 1;
            }
            
            // Fix saves
            if (!cls.system.saves || cls.system.saves.length === 0) {
                // Default saves basati sulla classe
                const savesMap = {
                    'barbaro': ['str', 'con'],
                    'bardo': ['dex', 'cha'],
                    'chierico': ['wis', 'cha'],
                    'druido': ['int', 'wis'],
                    'guerriero': ['str', 'con'],
                    'ladro': ['dex', 'int'],
                    'mago': ['int', 'wis'],
                    'monaco': ['str', 'dex'],
                    'paladino': ['wis', 'cha'],
                    'ranger': ['str', 'dex'],
                    'stregone': ['con', 'cha'],
                    'warlock': ['wis', 'cha']
                };
                
                const className = cls.name.toLowerCase();
                cls.system.saves = savesMap[className] || ['str', 'dex'];
            }
            
            // Fix primaryAbility se mancante
            if (!cls.system.primaryAbility) {
                const abilityMap = {
                    'barbaro': 'str',
                    'bardo': 'cha',
                    'chierico': 'wis',
                    'druido': 'wis',
                    'guerriero': 'str',
                    'ladro': 'dex',
                    'mago': 'int',
                    'monaco': 'dex',
                    'paladino': 'str',
                    'ranger': 'dex',
                    'stregone': 'cha',
                    'warlock': 'cha'
                };
                
                const className = cls.name.toLowerCase();
                cls.system.primaryAbility = abilityMap[className] || 'str';
            }
            
            fs.writeFileSync(filePath, JSON.stringify(cls, null, 2));
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    });
    
    log(`Classi corrette: ${fixed}/${files.length}`, 'success');
}

// 3. Fix container tipo non valido
async function fixContainers() {
    log('\nFIX CONTAINER', 'header');
    
    const equipPath = 'packs_normalized/equipaggiamento/_source';
    
    if (!fs.existsSync(equipPath)) {
        log('Directory equipaggiamento non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(equipPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    files.forEach(file => {
        const filePath = path.join(equipPath, file);
        try {
            const item = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Converti container in backpack/equipment
            if (item.type === 'container') {
                // I container in D&D 5e sono di tipo 'backpack'
                item.type = 'backpack';
                
                if (!item.system) {
                    item.system = {};
                }
                
                // Aggiungi capacity se mancante
                if (!item.system.capacity) {
                    item.system.capacity = {
                        type: 'weight',
                        value: 30,  // 30 lb default
                        weightless: false
                    };
                }
                
                // Aggiungi peso e prezzo se mancanti
                if (!item.system.weight) {
                    item.system.weight = 2; // 2 lb per una borsa
                }
                
                if (!item.system.price) {
                    item.system.price = {
                        value: 2,
                        denomination: 'gp'
                    };
                }
                
                if (!item.system.quantity) {
                    item.system.quantity = 1;
                }
                
                fixed++;
                fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    });
    
    log(`Container corretti: ${fixed}`, 'success');
}

// 4. Fix hook deprecati nei moduli
async function fixDeprecatedHooks() {
    log('\nFIX HOOK DEPRECATI', 'header');
    
    const modulesPath = 'modules';
    
    if (!fs.existsSync(modulesPath)) {
        log('Directory modules non trovata', 'error');
        return;
    }
    
    const files = [
        'brancalonia-init.js',
        'brancalonia-rules-chat.js',
        'brancalonia-tavern-brawl.js',
        'brancalonia-ui-hooks.js'
    ];
    
    let fixed = 0;
    
    files.forEach(file => {
        const filePath = path.join(modulesPath, file);
        if (!fs.existsSync(filePath)) {
            log(`File ${file} non trovato`, 'warning');
            return;
        }
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Fix CONFIG.statusEffects.push deprecato
            if (content.includes('CONFIG.statusEffects.push')) {
                content = content.replace(
                    /CONFIG\.statusEffects\.push\(/g,
                    'CONFIG.statusEffects = CONFIG.statusEffects.concat(['
                ).replace(
                    /\)(\s*;)/g,
                    '])$1'
                );
                modified = true;
            }
            
            // Fix renderChatMessage hook deprecato (usa renderChatLog)
            if (content.includes('renderChatMessage')) {
                content = content.replace(
                    /Hooks\.on\(["']renderChatMessage["']/g,
                    'Hooks.on("renderChatLog"'
                );
                modified = true;
            }
            
            // Fix evaluate senza await
            const evaluatePattern = /(?<!await\s+)(\w+\.evaluate\(\))/g;
            if (evaluatePattern.test(content)) {
                content = content.replace(
                    evaluatePattern,
                    'await $1'
                );
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content);
                fixed++;
                log(`Fixed ${file}`, 'success');
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    });
    
    log(`Moduli con hook corretti: ${fixed}/${files.length}`, 'success');
}

// 5. Fix background senza tipo
async function fixBackgrounds() {
    log('\nFIX BACKGROUNDS', 'header');
    
    const bgPath = 'packs_normalized/backgrounds/_source';
    
    if (!fs.existsSync(bgPath)) {
        log('Directory backgrounds non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(bgPath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    files.forEach(file => {
        const filePath = path.join(bgPath, file);
        try {
            const bg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Fix tipo mancante
            if (!bg.type) {
                bg.type = 'background';
                fixed++;
            }
            
            // Assicura che system esista
            if (!bg.system) {
                bg.system = {};
            }
            
            // Fix advancement se necessario
            if (!bg.system.advancement || bg.system.advancement.length === 0) {
                bg.system.advancement = [
                    {
                        "_id": "skill_" + Math.random().toString(36).substring(7),
                        "type": "Trait",
                        "configuration": {
                            "choices": [
                                {
                                    "count": 2
                                }
                            ],
                            "grants": [],
                            "mode": "choose",
                            "allowReplacements": false
                        },
                        "value": {}
                    }
                ];
            }
            
            fs.writeFileSync(filePath, JSON.stringify(bg, null, 2));
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    });
    
    log(`Background corretti: ${fixed}/${files.length}`, 'success');
}

// 6. Sincronizza le modifiche con packs/
async function syncToPacks() {
    log('\nSINCRONIZZAZIONE CON PACKS/', 'header');
    
    const packsToCopy = [
        'incantesimi',
        'classi',
        'equipaggiamento',
        'backgrounds'
    ];
    
    for (const pack of packsToCopy) {
        const sourcePath = `packs_normalized/${pack}/_source`;
        const targetPath = `packs/${pack}/_source`;
        
        if (!fs.existsSync(sourcePath)) {
            log(`Source ${sourcePath} non trovato`, 'warning');
            continue;
        }
        
        // Crea directory se non esiste
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
        
        // Copia tutti i file
        const files = fs.readdirSync(sourcePath);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                const sourceFile = path.join(sourcePath, file);
                const targetFile = path.join(targetPath, file);
                fs.copyFileSync(sourceFile, targetFile);
            }
        });
        
        log(`Sincronizzati ${files.length} file per ${pack}`, 'success');
    }
}

// Esegui tutti i fix
async function runAllFixes() {
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.magenta}    FIX AUTOMATICO PROBLEMI COMPLIANCE${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
    
    await fixSpells();
    await fixClasses();
    await fixContainers();
    await fixDeprecatedHooks();
    await fixBackgrounds();
    await syncToPacks();
    
    console.log(`\n${colors.green}✅ TUTTI I FIX COMPLETATI${colors.reset}`);
    console.log(`${colors.cyan}Ora esegui: node compile-with-keys.cjs per compilare i database${colors.reset}`);
    console.log(`${colors.cyan}Poi: node validate-project-compliance.cjs per verificare i miglioramenti${colors.reset}\n`);
}

// Esegui
runAllFixes();
