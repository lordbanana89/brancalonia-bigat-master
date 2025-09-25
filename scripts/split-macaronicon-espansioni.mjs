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

const source = path.resolve('database', 'macaronicon', 'espansioni_tematiche', 'TUTTE_ESPANSIONI.json');
if (!fs.existsSync(source)) {
  console.error('File TUTTE_ESPANSIONI.json non trovato');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const baseDir = path.resolve('database', 'macaronicon', 'espansioni_tematiche');

const index = {
  categoria: 'Espansioni Tematiche',
  descrizione: data.descrizione,
  fonte: data.fonte,
  totale: 0,
  espansioni: []
};

(data.espansioni || []).forEach((exp, idx) => {
  const slug = slugify(exp.titolo || `espansione-${idx + 1}`);
  const dirName = `${String(idx + 1).padStart(2, '0')}_${slug}`;
  const dir = path.join(baseDir, dirName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileData = { ...exp, fonte: data.fonte };
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(fileData, null, 2));

  index.espansioni.push({
    numero: idx + 1,
    titolo: exp.titolo,
    directory: dirName,
    file: `${dirName}/index.json`
  });
});

index.totale = index.espansioni.length;
fs.writeFileSync(path.join(baseDir, 'index.json'), JSON.stringify(index, null, 2));

fs.writeFileSync(source, JSON.stringify({ riferimento: 'index.json' }, null, 2));

console.log('Espansioni tematiche suddivise in cartelle dedicate.');
