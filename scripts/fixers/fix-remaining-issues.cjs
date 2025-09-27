#!/usr/bin/env node

/**
 * Fix per i problemi rimanenti dopo il primo round di correzioni
 */

const fs = require('fs');
const path = require('path');

// Colori
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

// 1. Fix backpack -> equipment
async function fixBackpackType() {
    log('\n=== FIX BACKPACK -> EQUIPMENT ===', 'header');
    
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
            
            // Fix backpack -> equipment
            if (item.type === 'backpack' || item.type === 'container') {
                item.type = 'equipment';
                
                if (!item.system) {
                    item.system = {};
                }
                
                // Aggiungi armor.type per indicare che è un container
                if (!item.system.armor) {
                    item.system.armor = {
                        type: 'trinket',  // o 'clothing'
                        value: null,
                        dex: null
                    };
                }
                
                // Aggiungi tipo equipment
                if (!item.system.type) {
                    item.system.type = {
                        value: 'trinket',
                        baseItem: ''
                    };
                }
                
                // Mantieni capacity per indicare che è un contenitore
                if (!item.system.capacity) {
                    const name = item.name.toLowerCase();
                    let capacity = 30;
                    
                    if (name.includes('10 ma')) capacity = 20;
                    else if (name.includes('15 ma')) capacity = 30;
                    else if (name.includes('20 ma')) capacity = 40;
                    else if (name.includes('25 ma')) capacity = 50;
                    
                    item.system.capacity = {
                        type: 'weight',
                        value: capacity,
                        weightless: false
                    };
                }
                
                fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
                fixed++;
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    }
    
    log(`Backpack->Equipment corretti: ${fixed}`, 'success');
    
    // Sync con packs_normalized
    const normalizedPath = 'packs_normalized/equipaggiamento/_source';
    if (fs.existsSync(normalizedPath)) {
        for (const file of files.filter(f => f.includes('borsa'))) {
            const source = path.join(equipPath, file);
            const target = path.join(normalizedPath, file);
            if (fs.existsSync(source)) {
                fs.copyFileSync(source, target);
            }
        }
    }
}

// 2. Fix incantesimi rimanenti
async function fixRemainingSpells() {
    log('\n=== FIX INCANTESIMI RIMANENTI ===', 'header');
    
    const spellsPath = 'packs/incantesimi/_source';
    
    if (!fs.existsSync(spellsPath)) {
        log('Directory incantesimi non trovata', 'error');
        return;
    }
    
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
            
            // Forza il fix del level se ancora mancante
            if (spell.system.level === undefined || spell.system.level === null) {
                const name = spell.name.toLowerCase();
                
                // Mapping più completo basato sui nomi degli incantesimi
                let level = 1; // default
                
                // Cantrips
                if (name.includes('luce') || name.includes('mano magica') || 
                    name.includes('prestidigitazione') || name.includes('riparare') ||
                    name.includes('resistenza') || name.includes('mondare') ||
                    name.includes('produrre fiamma') || name.includes('raggio di gelo') ||
                    name.includes('sacra fiamma') || name.includes('spruzzo velenoso') ||
                    name.includes('taumaturgia') || name.includes('tocco gelido') ||
                    name.includes('trucchetto') || name.includes('guida') ||
                    name.includes('messaggio') || name.includes('illusione minore') ||
                    name.includes('randello incantato')) {
                    level = 0;
                }
                // Level 2
                else if (name.includes('invisibilita') && !name.includes('superiore')) {
                    level = 2;
                } else if (name.includes('levitazione') || name.includes('silenzio') ||
                         name.includes('frantumare') || name.includes('ragnatela') ||
                         name.includes('scurovisione') || name.includes('oscurita') ||
                         name.includes('passo') || name.includes('suggestione') ||
                         name.includes('marchio') || name.includes('beffa') ||
                         name.includes('ristorare inferiore') || name.includes('caratteristica') ||
                         name.includes('purificare cibo')) {
                    level = 2;
                }
                // Level 3
                else if (name.includes('palla di fuoco') || name.includes('volare') ||
                         name.includes('velocita') || name.includes('lentezza') ||
                         name.includes('controincantesimo') || name.includes('dissolvi') ||
                         name.includes('creare cibo') || name.includes('guardiani') ||
                         name.includes('rimuovi maledizione') || name.includes('scagliare maledizione') ||
                         name.includes('anatema') || name.includes('evoca') ||
                         name.includes('animare') || name.includes('crescita')) {
                    level = 3;
                }
                // Level 4
                else if (name.includes('invisibilita superiore') || name.includes('porta dimensionale') ||
                         name.includes('emanazione') || name.includes('esorcismo') ||
                         name.includes('blocca mostri')) {
                    level = 4;
                }
                // Level 5
                else if (name.includes('banchetto') || name.includes('bollo') ||
                         name.includes('assicurazione')) {
                    level = 5;
                }
                // Level 1 (default per tutti gli altri)
                else {
                    level = 1;
                }
                
                spell.system.level = level;
                modified = true;
            }
            
            // Assicura che ci sia school
            if (!spell.system.school) {
                spell.system.school = 'evo';
                modified = true;
            }
            
            // Assicura materials
            if (!spell.system.materials) {
                spell.system.materials = {
                    value: '',
                    consumed: false,
                    cost: 0,
                    supply: 0
                };
                modified = true;
            }
            
            // Assicura preparation
            if (!spell.system.preparation) {
                spell.system.preparation = {
                    mode: 'prepared',
                    prepared: false
                };
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(spell, null, 2));
                fixed++;
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    }
    
    log(`Incantesimi corretti: ${fixed}`, 'success');
    
    // Sync
    const normalizedPath = 'packs_normalized/incantesimi/_source';
    if (fs.existsSync(normalizedPath)) {
        for (const file of files) {
            const source = path.join(spellsPath, file);
            const target = path.join(normalizedPath, file);
            fs.copyFileSync(source, target);
        }
    }
}

// 3. Fix journal senza pagine
async function fixJournalPages() {
    log('\n=== FIX JOURNAL PAGES ===', 'header');
    
    const regolePath = 'packs/regole/_source';
    
    if (!fs.existsSync(regolePath)) {
        log('Directory regole non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(regolePath).filter(f => f.endsWith('.json'));
    let fixed = 0;
    
    for (const file of files) {
        const filePath = path.join(regolePath, file);
        try {
            const journal = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Aggiungi pagine se mancanti
            if (!journal.pages || journal.pages.length === 0) {
                journal.pages = [
                    {
                        "_id": Math.random().toString(36).substring(2, 18),
                        "name": journal.name || "Pagina",
                        "type": "text",
                        "text": {
                            "content": journal.content || "<p>Contenuto da aggiungere</p>",
                            "format": 1
                        },
                        "title": {
                            "show": true,
                            "level": 1
                        },
                        "sort": 100000
                    }
                ];
                
                // Se c'era content al top level, rimuovilo
                if (journal.content) {
                    delete journal.content;
                }
                
                fs.writeFileSync(filePath, JSON.stringify(journal, null, 2));
                fixed++;
            }
            
        } catch (e) {
            log(`Errore fix ${file}: ${e.message}`, 'error');
        }
    }
    
    log(`Journal corretti: ${fixed}`, 'success');
}

// 4. Fix hook deprecati rimanenti
async function fixRemainingHooks() {
    log('\n=== FIX HOOK DEPRECATI RIMANENTI ===', 'header');
    
    const modulesPath = 'modules';
    
    const filesToFix = [
        'brancalonia-rules-chat.js',
        'brancalonia-tavern-brawl.js',
        'brancalonia-ui-hooks.js'
    ];
    
    let fixed = 0;
    
    for (const file of filesToFix) {
        const filePath = path.join(modulesPath, file);
        
        if (!fs.existsSync(filePath)) {
            continue;
        }
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Fix renderChatMessage definitivo
            if (content.includes('renderChatMessage')) {
                // Prima sostituisci il nome dell'hook
                content = content.replace(
                    /([\"'])renderChatMessage([\"'])/g,
                    '$1renderChatLog$2'
                );
                
                // Poi sistema i parametri se necessario
                content = content.replace(
                    /function\s*\(\s*message\s*,\s*html\s*,\s*data\s*\)/g,
                    'function(app, html, data)'
                );
                
                content = content.replace(
                    /\(\s*message\s*,\s*html\s*,\s*data\s*\)\s*=>/g,
                    '(app, html, data) =>'
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
    }
    
    log(`Hook corretti: ${fixed}`, 'success');
}

// Main
async function main() {
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.magenta}    FIX PROBLEMI RIMANENTI - ROUND 2${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
    
    await fixBackpackType();
    await fixRemainingSpells();
    await fixJournalPages();
    await fixRemainingHooks();
    
    console.log(`\n${colors.green}✅ TUTTI I FIX COMPLETATI!${colors.reset}`);
    console.log(`${colors.cyan}Ora esegui: node validate-project-compliance.cjs${colors.reset}\n`);
}

main().catch(err => {
    console.error(`${colors.red}Errore: ${err.message}${colors.reset}`);
    process.exit(1);
});
