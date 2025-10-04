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
      // CONVERTI TUTTO IN NEDB (formato più compatibile con Foundry v13)
      // NeDB crea un file singolo .db invece di directory LevelDB
      await compilePack(srcDir, path.join(packDir, `${packName}.db`), {
        log: true,
        nedb: true
      });
      console.log(`✅ ${packName} compilato con successo (NeDB)`);
    } catch (error) {
      console.error(`❌ Errore compilando ${packName}:`, error.message);
    }
  }

  console.log('\n✅ Compilazione completata!');
}

buildPacks().catch(console.error);