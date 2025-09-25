#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const source = path.resolve('database', 'equipaggiamento', 'intrugli.json');
if (!fs.existsSync(source)) {
  console.error('Sorgente intrugli non trovata');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const target = path.resolve('database', 'equipaggiamento', 'intrugli');
if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

const index = {
  categoria: data.categoria,
  fonte: data.fonte,
  descrizione: data.descrizione,
  nota_generale: data.nota_generale || null,
  totale: 0,
  elementi: []
};

(data.intrugli || []).forEach((item, i) => {
  const id = `intruglio-${String(i + 1).padStart(3, '0')}`;
  const filename = `${id}.json`;
  fs.writeFileSync(path.join(target, filename), JSON.stringify({ id, ...item, fonte: data.fonte }, null, 2));
  index.elementi.push({ id, nome: item.nome, file: filename });
});
index.totale = index.elementi.length;
fs.writeFileSync(path.join(target, 'index.json'), JSON.stringify(index, null, 2));

fs.writeFileSync(source, JSON.stringify({ riferimento: 'intrugli/index.json' }, null, 2));

console.log('Intrugli suddivisi in directory intrugli/');
