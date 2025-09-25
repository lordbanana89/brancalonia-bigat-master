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

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const root = path.resolve(__dirname, '..', 'database', 'macaronicon', 'incantesimi');
const source = path.join(root, 'TUTTI_INCANTESIMI.json');

if (!fs.existsSync(source)) {
  console.error('Sorgente non trovata:', source);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const outputRoot = path.join(root, 'dettagli');

ensureDir(outputRoot);

const globalIndex = {
  categoria: 'Incantesimi del Macaronicon',
  descrizione: data.descrizione || 'Nuovi incantesimi tematici',
  fonte: data.fonte || 'Brancalonia Macaronicon',
  totale: 0,
  livelli: []
};

let counter = 1;

for (const [key, spells] of Object.entries(data)) {
  if (!key.startsWith('incantesimi_livello_')) continue;
  const livello = Number(key.replace('incantesimi_livello_', ''));
  const levelDir = path.join(outputRoot, `livello_${livello}`);
  ensureDir(levelDir);

  const levelIndex = {
    livello,
    totale: spells.length,
    elementi: []
  };

  spells.forEach(spell => {
    const id = `mac-spell-${String(counter).padStart(3, '0')}`;
    const slug = slugify(spell.nome);
    const filename = `${id}_${slug}.json`;

    const spellData = {
      id,
      livello,
      nome: spell.nome,
      scuola: spell.scuola,
      tempo_lancio: spell.tempo_lancio,
      gittata: spell.gittata,
      componenti: spell.componenti,
      durata: spell.durata,
      descrizione: spell.descrizione,
      classi: spell.classi || [],
      rituale: Boolean(spell.rituale),
      fonte: data.fonte || 'Brancalonia Macaronicon p.50-52',
      validazione: {
        estratto_da: 'Brancalonia-Macaronicon-ITA-2-2.txt',
        completo: true
      }
    };

    writeJSON(path.join(levelDir, filename), spellData);

    levelIndex.elementi.push({
      id,
      nome: spell.nome,
      file: filename
    });

    counter += 1;
  });

  writeJSON(path.join(levelDir, 'index.json'), levelIndex);

  globalIndex.livelli.push({
    livello,
    totale: spells.length,
    directory: `dettagli/livello_${livello}`
  });

  globalIndex.totale += spells.length;
}

writeJSON(path.join(outputRoot, 'index.json'), globalIndex);

console.log('Incantesimi suddivisi correttamente in', outputRoot);
