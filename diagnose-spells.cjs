#!/usr/bin/env node

/**
 * Script diagnostico per capire perché gli incantesimi vengono segnalati
 * come senza level anche quando ce l'hanno
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
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
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

async function diagnoseSpells() {
    log('\n=== DIAGNOSI INCANTESIMI ===', 'header');
    
    const spellsPath = 'packs/incantesimi/_source';
    
    if (!fs.existsSync(spellsPath)) {
        log('Directory incantesimi non trovata', 'error');
        return;
    }
    
    const files = fs.readdirSync(spellsPath).filter(f => f.endsWith('.json'));
    
    const stats = {
        total: 0,
        withLevel: 0,
        withoutLevel: 0,
        levelTypes: {},
        withSystemLevel: 0,
        withFlagsLevel: 0,
        levelValues: {},
        problematicFiles: []
    };
    
    // Analizza ogni file
    for (const file of files) {
        const filePath = path.join(spellsPath, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const spell = JSON.parse(content);
            
            stats.total++;
            
            // Controlla vari posti dove potrebbe essere il level
            let hasLevel = false;
            let levelValue = null;
            let levelLocation = null;
            
            // Check 1: system.level
            if (spell.system && spell.system.level !== undefined) {
                hasLevel = true;
                levelValue = spell.system.level;
                levelLocation = 'system.level';
                stats.withSystemLevel++;
                
                // Registra il tipo di dato
                const levelType = typeof spell.system.level;
                stats.levelTypes[levelType] = (stats.levelTypes[levelType] || 0) + 1;
            }
            
            // Check 2: flags.dnd5e.itemData.level  
            if (spell.flags && spell.flags.dnd5e && spell.flags.dnd5e.itemData && 
                spell.flags.dnd5e.itemData.level !== undefined) {
                stats.withFlagsLevel++;
                if (!hasLevel) {
                    hasLevel = true;
                    levelValue = spell.flags.dnd5e.itemData.level;
                    levelLocation = 'flags.dnd5e.itemData.level';
                }
            }
            
            // Check 3: data.level (vecchio formato)
            if (spell.data && spell.data.level !== undefined) {
                if (!hasLevel) {
                    hasLevel = true;
                    levelValue = spell.data.level;
                    levelLocation = 'data.level';
                }
            }
            
            if (hasLevel) {
                stats.withLevel++;
                // Registra il valore del level
                const levelKey = `Level ${levelValue}`;
                stats.levelValues[levelKey] = (stats.levelValues[levelKey] || 0) + 1;
            } else {
                stats.withoutLevel++;
                stats.problematicFiles.push({
                    file: file,
                    name: spell.name,
                    hasSystem: !!spell.system,
                    systemKeys: spell.system ? Object.keys(spell.system).join(', ') : 'N/A'
                });
            }
            
            // Log dettagliato per i primi file problematici
            if (stats.problematicFiles.length <= 3 && !hasLevel) {
                console.log(`\n${colors.yellow}File problematico: ${file}${colors.reset}`);
                console.log('Nome:', spell.name);
                console.log('Ha system?', !!spell.system);
                if (spell.system) {
                    console.log('Chiavi in system:', Object.keys(spell.system));
                    console.log('system.level:', spell.system.level);
                }
            }
            
        } catch (e) {
            log(`Errore lettura ${file}: ${e.message}`, 'error');
        }
    }
    
    // Report
    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}REPORT DIAGNOSI${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
    
    console.log(`Total files: ${stats.total}`);
    console.log(`Con level: ${stats.withLevel} (${Math.round(stats.withLevel/stats.total*100)}%)`);
    console.log(`Senza level: ${stats.withoutLevel} (${Math.round(stats.withoutLevel/stats.total*100)}%)`);
    console.log(`Con system.level: ${stats.withSystemLevel}`);
    console.log(`Con flags.dnd5e.itemData.level: ${stats.withFlagsLevel}`);
    
    console.log('\nTipi di dato per level:');
    for (const [type, count] of Object.entries(stats.levelTypes)) {
        console.log(`  ${type}: ${count}`);
    }
    
    console.log('\nDistribuzione levels:');
    for (const [level, count] of Object.entries(stats.levelValues)) {
        console.log(`  ${level}: ${count}`);
    }
    
    console.log('\n' + colors.red + 'FILE PROBLEMATICI:' + colors.reset);
    for (const prob of stats.problematicFiles.slice(0, 10)) {
        console.log(`- ${prob.file} (${prob.name})`);
        console.log(`  System: ${prob.hasSystem}, Keys: ${prob.systemKeys}`);
    }
    if (stats.problematicFiles.length > 10) {
        console.log(`... e altri ${stats.problematicFiles.length - 10} file`);
    }
    
    // Suggerimenti
    console.log(`\n${colors.magenta}ANALISI:${colors.reset}`);
    if (stats.withoutLevel > 0) {
        console.log('⚠️  Molti file non hanno il campo level in system');
        console.log('   Possibile causa: il validatore controlla solo system.level');
        console.log('   Soluzione: assicurarsi che tutti abbiano system.level come numero');
    }
}

// Esegui diagnosi
diagnoseSpells();
