#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const classes = [
  { file: 'arlecchino-bardo.json', folder: 'arlecchino_bardo' },
  { file: 'benandante-druido.json', folder: 'benandante_druido' },
  { file: 'brigante-ladro.json', folder: 'brigante_ladro' },
  { file: 'cavaliere-errante-paladino.json', folder: 'cavaliere_errante_paladino' },
  { file: 'frate-monaco.json', folder: 'frate_monaco' },
  { file: 'guiscardo-mago.json', folder: 'guiscardo_mago' },
  { file: 'mattatore-ranger.json', folder: 'mattatore_ranger' },
  { file: 'menagramo-warlock.json', folder: 'menagramo_warlock' },
  { file: 'miracolaro-chierico.json', folder: 'miracolaro_chierico' },
  { file: 'scaramante-stregone.json', folder: 'scaramante_stregone' },
  { file: 'spadaccino-guerriero.json', folder: 'spadaccino_guerriero' }
];

const root = path.resolve('database', 'classi');

for (const cls of classes) {
  const source = path.join(root, cls.file);
  if (!fs.existsSync(source)) {
    console.warn('Sorgente mancante:', source);
    continue;
  }

  const raw = fs.readFileSync(source, 'utf8').trim();
  if (!raw) {
    console.warn('Sorgente vuota, probabilmente gia migrata:', source);
    continue;
  }

  const data = JSON.parse(raw);
  const target = path.join(root, cls.folder);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const index = {
    nome: data.nome,
    classe_base: data.classe_base,
    fonte: data.fonte,
    descrizione: data.descrizione,
    tipo: data.tipo,
    sottoclasse: data.sottoclasse,
    validazione: data.validazione || {}
  };
  fs.writeFileSync(path.join(target, 'index.json'), JSON.stringify(index, null, 2));

  const privDir = path.join(target, 'privilegi');
  if (!fs.existsSync(privDir)) fs.mkdirSync(privDir);
  const privIndex = [];
  for (const [levelKey, abilities] of Object.entries(data.privilegi || {})) {
    const livello = Number(levelKey.replace('livello_', ''));
    for (const [name, detail] of Object.entries(abilities)) {
      const id = `${cls.folder}-${levelKey}-${name}`.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      const file = `${id}.json`;
      fs.writeFileSync(path.join(privDir, file), JSON.stringify({ id, livello, nome: name, ...detail }, null, 2));
      privIndex.push({ id, livello, nome: name, file });
    }
  }
  privIndex.sort((a, b) => a.livello - b.livello || a.nome.localeCompare(b.nome));
  fs.writeFileSync(path.join(privDir, 'index.json'), JSON.stringify({ totale: privIndex.length, privilegi: privIndex }, null, 2));

  // Rinomina originale come pointer
  const pointer = {
    riferimento: path.join(cls.folder, 'index.json')
  };
  fs.writeFileSync(source, JSON.stringify(pointer, null, 2));
}
