#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

const source = path.resolve('database', 'macaronicon', 'png_mostri', 'TUTTI_PNG_MOSTRI.json');
if (!fs.existsSync(source)) {
  console.error('File TUTTI_PNG_MOSTRI.json non trovato');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const baseDir = path.resolve('database', 'macaronicon', 'png_mostri');

const index = {
  categoria: 'PNG e Mostri Macaronicon',
  descrizione: data.descrizione,
  fonte: data.fonte,
  categorie: []
};

const categories = data.categorie || {};
for (const [category, entries] of Object.entries(categories)) {
  const dir = path.join(baseDir, category);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const catIndex = { categoria: category, totale: 0, elementi: [] };

  (entries || []).forEach((entry, idx) => {
    const slug = slugify(entry.nome || `${category}-${idx + 1}`);
    const id = `${category}-${String(idx + 1).padStart(3, '0')}`;
    const file = `${id}_${slug}.json`;
    fs.writeFileSync(path.join(dir, file), JSON.stringify({ id, ...entry, fonte: data.fonte }, null, 2));
    catIndex.elementi.push({ id, nome: entry.nome, file });
  });

  catIndex.totale = catIndex.elementi.length;
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(catIndex, null, 2));

  index.categorie.push({ nome: category, directory: category, totale: catIndex.totale, index: `${category}/index.json` });
}

fs.writeFileSync(path.join(baseDir, 'index.json'), JSON.stringify(index, null, 2));
fs.writeFileSync(source, JSON.stringify({ riferimento: 'index.json' }, null, 2));

console.log('PNG e mostri Macaronicon suddivisi per categoria.');
