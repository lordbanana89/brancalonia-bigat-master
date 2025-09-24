#!/usr/bin/env node

/**
 * Script per compilare i pack con il CLI ufficiale di Foundry VTT
 */

import { compilePack } from '@foundryvtt/foundryvtt-cli';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista dei pack da compilare
const packs = [
  'backgrounds',
  'brancalonia-features',
  'emeriticenze',
  'equipaggiamento',
  'incantesimi',
  'macro',
  'npc',
  'razze',
  'regole',
  'rollable-tables',
  'sottoclassi',
  'talenti'
];

async function buildPacks() {
  console.log('🔨 Compilazione pack con Foundry VTT CLI...\n');

  for (const packName of packs) {
    const packDir = path.join(__dirname, 'packs', packName);

    // Crea directory src se non esiste
    const srcDir = path.join(packDir, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });

      // Sposta i file JSON nella directory src
      const files = fs.readdirSync(packDir);
      for (const file of files) {
        if (file.endsWith('.json') && file !== '_source.json' && file !== '_sources.json') {
          const oldPath = path.join(packDir, file);
          const newPath = path.join(srcDir, file);
          fs.renameSync(oldPath, newPath);
        }
      }
    }

    try {
      // Compila il pack in formato LevelDB
      await compilePack(srcDir, packDir, { log: true });
      console.log(`✅ ${packName} compilato con successo`);
    } catch (error) {
      console.error(`❌ Errore compilando ${packName}:`, error.message);
    }
  }

  console.log('\n✅ Compilazione completata!');
}

buildPacks().catch(console.error);