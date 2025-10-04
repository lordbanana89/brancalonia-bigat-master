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
  'classi',
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

    // La nuova struttura mantiene i sorgenti in `_source`
    const srcDir = path.join(packDir, '_source');

    if (!fs.existsSync(srcDir)) {
      console.warn(`⚠️  Sorgenti mancanti per ${packName}: atteso ${srcDir}`);
      continue;
    }

    try {
      // Compila il pack - regole usa NeDB per JournalEntry
      if (packName === 'regole') {
        // Per JournalEntry usa NeDB (file singolo)
        await compilePack(srcDir, path.join(packDir, `${packName}.db`), {
          log: true,
          nedb: true
        });
      } else {
        // Altri pack usano LevelDB (directory)
        await compilePack(srcDir, packDir, { log: true });
      }
      console.log(`✅ ${packName} compilato con successo`);
    } catch (error) {
      console.error(`❌ Errore compilando ${packName}:`, error.message);
    }
  }

  console.log('\n✅ Compilazione completata!');
}

buildPacks().catch(console.error);