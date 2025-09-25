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

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const source = path.resolve(__dirname, '..', 'database', 'regole', 'SISTEMA_RISSA_COMPLETO.json');
if (!fs.existsSync(source)) {
  console.error('File sorgente non trovato:', source);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const targetDir = path.resolve(__dirname, '..', 'database', 'regole', 'rissa');
ensureDir(targetDir);

const index = {
  nome: data.nome,
  descrizione: data.descrizione,
  fonte: data.fonte,
  sezioni: []
};

// Regole base
const regoleBaseDir = path.join(targetDir, 'regole_base');
ensureDir(regoleBaseDir);
const regoleBaseEntries = [];
for (const [key, value] of Object.entries(data.regole_base || {})) {
  const id = `rissa-base-${slugify(key)}`;
  const file = `${id}.json`;
  fs.writeFileSync(path.join(regoleBaseDir, file), JSON.stringify({ id, titolo: key, testo: value, fonte: data.fonte }, null, 2));
  regoleBaseEntries.push({ id, titolo: key, file });
}
fs.writeFileSync(path.join(regoleBaseDir, 'index.json'), JSON.stringify({ totale: regoleBaseEntries.length, elementi: regoleBaseEntries }, null, 2));
index.sezioni.push({ nome: 'Regole base', path: 'regole_base/index.json' });

// Livelli Batoste
const livelliDir = path.join(targetDir, 'livelli_batoste');
ensureDir(livelliDir);
const livelliEntries = [];
for (const [level, info] of Object.entries(data.livelli_batoste || {})) {
  const id = `rissa-batoste-${level}`;
  const file = `${id}.json`;
  fs.writeFileSync(path.join(livelliDir, file), JSON.stringify({ id, livello: Number(level), ...info, fonte: data.fonte }, null, 2));
  livelliEntries.push({ id, livello: Number(level), nome: info.nome, file });
}
livelliEntries.sort((a, b) => a.livello - b.livello);
fs.writeFileSync(path.join(livelliDir, 'index.json'), JSON.stringify({ totale: livelliEntries.length, elementi: livelliEntries }, null, 2));
index.sezioni.push({ nome: 'Livelli Batoste', path: 'livelli_batoste/index.json' });

// Mosse base
const mosseBaseDir = path.join(targetDir, 'mosse_base');
ensureDir(mosseBaseDir);
const mosseBaseEntries = [];
for (const [key, info] of Object.entries(data.mosse_base || {})) {
  const id = `rissa-mossa-base-${slugify(key)}`;
  const file = `${id}.json`;
  fs.writeFileSync(path.join(mosseBaseDir, file), JSON.stringify({ id, ...info, fonte: data.fonte }, null, 2));
  mosseBaseEntries.push({ id, nome: info.nome, file });
}
fs.writeFileSync(path.join(mosseBaseDir, 'index.json'), JSON.stringify({ totale: mosseBaseEntries.length, elementi: mosseBaseEntries }, null, 2));
index.sezioni.push({ nome: 'Mosse base', path: 'mosse_base/index.json' });

// Slot mossa
const slotDir = path.join(targetDir, 'slot_mossa');
ensureDir(slotDir);
fs.writeFileSync(path.join(slotDir, 'progressione.json'), JSON.stringify(data.slot_mossa || {}, null, 2));
index.sezioni.push({ nome: 'Slot Mossa', path: 'slot_mossa/progressione.json' });

// Mosse speciali
const mosseSpecDir = path.join(targetDir, 'mosse_speciali');
ensureDir(mosseSpecDir);
const mosseSpecEntries = [];
for (const mossa of data.mosse_speciali || []) {
  const id = `rissa-mossa-${slugify(mossa.nome)}`;
  const file = `${id}.json`;
  fs.writeFileSync(path.join(mosseSpecDir, file), JSON.stringify({ id, ...mossa, fonte: data.fonte }, null, 2));
  mosseSpecEntries.push({ id, nome: mossa.nome, file });
}
fs.writeFileSync(path.join(mosseSpecDir, 'index.json'), JSON.stringify({ totale: mosseSpecEntries.length, elementi: mosseSpecEntries }, null, 2));
index.sezioni.push({ nome: 'Mosse Speciali', path: 'mosse_speciali/index.json' });

// Armi improvvisate
const armiDir = path.join(targetDir, 'armi_improvvisate');
ensureDir(armiDir);
fs.writeFileSync(path.join(armiDir, 'armi.json'), JSON.stringify(data.armi_improvvisate || [], null, 2));
index.sezioni.push({ nome: 'Armi improvvisate', path: 'armi_improvvisate/armi.json' });

// Effetti ambientali, PNG, premi se presenti
if (data.effetti_ambientali) {
  const effDir = path.join(targetDir, 'effetti_ambientali');
  ensureDir(effDir);
  fs.writeFileSync(path.join(effDir, 'effetti.json'), JSON.stringify(data.effetti_ambientali, null, 2));
  index.sezioni.push({ nome: 'Effetti Ambientali', path: 'effetti_ambientali/effetti.json' });
}

if (data.png_tipici) {
  const pngDir = path.join(targetDir, 'png_tipici');
  ensureDir(pngDir);
  fs.writeFileSync(path.join(pngDir, 'png.json'), JSON.stringify(data.png_tipici, null, 2));
  index.sezioni.push({ nome: 'PNG Tipici', path: 'png_tipici/png.json' });
}

if (data.premi_bagordi) {
  const premiDir = path.join(targetDir, 'premi');
  ensureDir(premiDir);
  fs.writeFileSync(path.join(premiDir, 'premi.json'), JSON.stringify(data.premi_bagordi, null, 2));
  index.sezioni.push({ nome: 'Premi e Bagordi', path: 'premi/premi.json' });
}

fs.writeFileSync(path.join(targetDir, 'index.json'), JSON.stringify(index, null, 2));

console.log('Sistema Rissa suddiviso in', targetDir);
