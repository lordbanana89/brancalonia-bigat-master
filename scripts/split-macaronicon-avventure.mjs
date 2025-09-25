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

const source = path.resolve('database', 'macaronicon', 'avventure', 'TUTTE_AVVENTURE.json');
if (!fs.existsSync(source)) {
  console.error('File TUTTE_AVVENTURE.json non trovato');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const baseDir = path.resolve('database', 'macaronicon', 'avventure');

const index = {
  categoria: 'Avventure Macaronicon',
  descrizione: data.descrizione,
  fonte: data.fonte,
  totale: 0,
  avventure: []
};

(data.avventure || []).forEach(avv => {
  const number = avv.numero || index.avventure.length + 1;
  const slug = slugify(avv.titolo || `avventura-${number}`);
  const dirName = `${String(number).padStart(2, '0')}_${slug}`;
  const dir = path.join(baseDir, dirName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileData = { ...avv, fonte: data.fonte };
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(fileData, null, 2));

  index.avventure.push({
    numero: number,
    titolo: avv.titolo,
    directory: dirName,
    file: `${dirName}/index.json`
  });
});

index.totale = index.avventure.length;
fs.writeFileSync(path.join(baseDir, 'index.json'), JSON.stringify(index, null, 2));

fs.writeFileSync(source, JSON.stringify({ riferimento: 'index.json' }, null, 2));

console.log('Avventure del Macaronicon suddivise in cartelle dedicate.');
