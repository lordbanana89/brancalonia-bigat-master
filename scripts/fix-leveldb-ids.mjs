#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

function fixId(id) {
    if (!id) return id;
    // Rimuovi trattini e altri caratteri non validi per LevelDB
    return id.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '');
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        let modified = false;

        // Fix _id field
        if (data._id && data._id.includes('-')) {
            const oldId = data._id;
            data._id = fixId(data._id);
            console.log(`Fixed ID in ${path.basename(filePath)}: ${oldId} -> ${data._id}`);
            modified = true;
        }

        // Fix _key field if it contains the ID
        if (data._key && data._key.includes('-')) {
            // Estrai il tipo e ricostruisci la chiave
            const keyParts = data._key.split('!');
            if (keyParts.length === 3) {
                keyParts[2] = fixId(keyParts[2]);
                data._key = keyParts.join('!');
                modified = true;
            }
        }

        // Fix references in effects
        if (data.effects && Array.isArray(data.effects)) {
            data.effects.forEach(effect => {
                if (effect._id && effect._id.includes('-')) {
                    effect._id = fixId(effect._id);
                    modified = true;
                }
            });
        }

        // Fix references in pages (for journal entries)
        if (data.pages && Array.isArray(data.pages)) {
            data.pages.forEach(page => {
                if (page._id && page._id.includes('-')) {
                    page._id = fixId(page._id);
                    modified = true;
                }
            });
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
            return true;
        }
        return false;

    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

function processDirectory(dirPath) {
    let totalFixed = 0;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            totalFixed += processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            if (processFile(fullPath)) {
                totalFixed++;
            }
        }
    }

    return totalFixed;
}

console.log('Fixing LevelDB IDs in normalized packs...\n');

const packsDir = path.join(ROOT_DIR, 'packs_normalized');
const totalFixed = processDirectory(packsDir);

console.log(`\nFixed ${totalFixed} files with invalid IDs`);

// Also fix the original packs directory
console.log('\nFixing LevelDB IDs in original packs...\n');
const originalPacksDir = path.join(ROOT_DIR, 'packs');
const totalFixedOriginal = processDirectory(originalPacksDir);

console.log(`\nFixed ${totalFixedOriginal} files in original packs`);
console.log('\nDone! IDs are now LevelDB-compatible.');