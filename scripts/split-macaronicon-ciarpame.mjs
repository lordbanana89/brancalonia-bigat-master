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

const root = path.resolve(__dirname, '..', 'database', 'macaronicon', 'equipaggiamento');
const source = path.join(root, 'CIARPAME_MAGICO.json');

if (!fs.existsSync(source)) {
  console.error('Sorgente non trovata:', source);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const outputDir = path.join(root, 'ciarpame_magico');
ensureDir(outputDir);

const index = {
  categoria: 'Ciarpame Magico',
  descrizione: data.descrizione || 'Oggetti magici minori del Macaronicon',
  fonte: data.fonte || 'Brancalonia Macaronicon p.48-49',
  totale: 0,
  elementi: []
};

let counter = 1;

(data.oggetti_magici || []).forEach(obj => {
  const id = `mac-ciarp-${String(counter).padStart(3, '0')}`;
  const slug = slugify(obj.nome);
  const filename = `${id}_${slug}.json`;

  const objData = {
    id,
    nome: obj.nome,
    rarita: obj.rarita,
    tipo: obj.tipo,
    sintonia: obj.sintonia,
    descrizione: obj.descrizione,
    proprieta: obj.proprieta || [],
    effetti_speciali: {
      maledizione: obj.maledizione || null,
      note: obj.note || null,
      restrizione: obj.restrizione || null,
      rischio: obj.rischio || null,
      effetto_collaterale: obj.effetto_collaterale || null,
      difetto: obj.difetto || null
    },
    fonte: data.fonte || 'Brancalonia Macaronicon p.48-49',
    validazione: {
      estratto_da: 'Brancalonia-Macaronicon-ITA-2-2.txt',
      completo: true
    }
  };

  writeJSON(path.join(outputDir, filename), objData);

  index.elementi.push({
    id,
    nome: obj.nome,
    file: filename
  });

  counter += 1;
});

index.totale = index.elementi.length;
writeJSON(path.join(outputDir, 'index.json'), index);

console.log('Ciarpame magico suddiviso in', outputDir);
