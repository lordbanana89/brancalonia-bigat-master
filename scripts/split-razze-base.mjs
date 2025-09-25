#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const source = path.resolve('database', 'razze', 'dettagli', 'TUTTE_RAZZE_COMPLETE.json');
if (!fs.existsSync(source)) {
  console.error('Sorgente non trovata');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const baseDir = path.resolve('database', 'razze');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const excludedKeys = new Set(['fonte', 'descrizione']);

for (const [key, value] of Object.entries(data)) {
  if (excludedKeys.has(key)) continue;
  const dir = path.join(baseDir, key);
  ensureDir(dir);
  const index = {
    fonte: data.fonte || 'Brancalonia Manuale Base',
    descrizione_globale: data.descrizione || null,
    ...value
  };
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2));

  const pointerPath = path.join(baseDir, `${key}.json`);
  if (fs.existsSync(pointerPath)) {
    fs.writeFileSync(pointerPath, JSON.stringify({ riferimento: `${key}/index.json` }, null, 2));
  }
}

console.log('Razze base suddivise in directory dedicated.');
