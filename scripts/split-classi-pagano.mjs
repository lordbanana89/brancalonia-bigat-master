#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const source = path.resolve(__dirname, '..', 'database', 'classi', 'dettagli', 'pagano_barbaro_COMPLETO.json');
if (!fs.existsSync(source)) {
  console.error('File sorgente non trovato:', source);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const targetRoot = path.resolve(__dirname, '..', 'database', 'classi', 'pagano_barbaro');
ensureDir(targetRoot);

// index.json
const indexData = {
  id: 'class-barbaro-pagano',
  nome: data.nome,
  classe_base: data.nome_standard || 'Barbaro',
  descrizione: data.descrizione,
  fonte: data.fonte,
  dado_vita: data.dado_vita,
  punti_ferita: data.punti_ferita,
  competenze: data.competenze,
  equipaggiamento_iniziale: data.equipaggiamento_iniziale,
  multiclasse: data.multiclasse,
  note_brancalonia: data.note_brancalonia || {},
  validazione: data.validazione || {}
};
fs.writeFileSync(path.join(targetRoot, 'index.json'), JSON.stringify(indexData, null, 2));

// progressione
const progressDir = path.join(targetRoot, 'progressione');
ensureDir(progressDir);
fs.writeFileSync(path.join(progressDir, 'progressione.json'), JSON.stringify({ tabella: data.tabella_progressione }, null, 2));

// privilegi generali
const privDir = path.join(targetRoot, 'privilegi_generali');
ensureDir(privDir);
let privIndex = [];
for (const [levelKey, abilities] of Object.entries(data.privilegi_dettagliati || {})) {
  const livello = Number(levelKey.replace('livello_', ''));
  for (const [name, detail] of Object.entries(abilities)) {
    const id = `class-barbaro-${levelKey}-${slugify(name)}`;
    const file = `${id}.json`;
    const payload = {
      id,
      nome: name,
      livello,
      descrizione: detail.descrizione,
      benefici: detail.benefici || null,
      limitazioni: detail.limitazioni || detail.condizione || null,
      dettagli: detail,
      fonte: data.fonte
    };
    fs.writeFileSync(path.join(privDir, file), JSON.stringify(payload, null, 2));
    privIndex.push({ id, nome: name, livello, file });
  }
}
privIndex.sort((a, b) => a.livello - b.livello || a.nome.localeCompare(b.nome));
fs.writeFileSync(path.join(privDir, 'index.json'), JSON.stringify({ totale: privIndex.length, privilegi: privIndex }, null, 2));

// cammini
const camminiDir = path.join(targetRoot, 'cammini');
ensureDir(camminiDir);
const camminiIndex = [];
for (const [cammino, info] of Object.entries(data.cammini_brancalonia || {})) {
  const id = `class-barbaro-cammino-${slugify(cammino)}`;
  const file = `${id}.json`;
  fs.writeFileSync(path.join(camminiDir, file), JSON.stringify({ id, nome: cammino, livelli: info }, null, 2));
  camminiIndex.push({ id, nome: cammino, file });
}
fs.writeFileSync(path.join(camminiDir, 'index.json'), JSON.stringify({ totale: camminiIndex.length, cammini: camminiIndex }, null, 2));

console.log('Class Pagano/Barbaro suddivisa in', targetRoot);
