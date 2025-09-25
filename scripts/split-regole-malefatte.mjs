#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const source = path.resolve('database', 'regole', 'SISTEMA_MALEFATTE_TAGLIA_COMPLETO.json');
if (!fs.existsSync(source)) {
  console.error('Sorgente non trovata');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, 'utf8'));
const target = path.resolve('database', 'regole', 'malefatte_taglia');
if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

const index = {
  nome: data.nome,
  descrizione: data.descrizione,
  fonte: data.fonte,
  componenti: data.componenti || [],
  sezioni: []
};

function writeJSON(dir, name, obj) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(obj, null, 2));
}

// Malefatte base
if (data.malefatte) {
  const malDir = path.join(target, 'malefatte');
  writeJSON(malDir, 'descrizione.json', {
    descrizione: data.malefatte.descrizione,
    accumulo: data.malefatte.accumulo,
    riduzione: data.malefatte.riduzione,
    fonte: data.fonte
  });
  index.sezioni.push({ nome: 'Malefatte - Base', path: 'malefatte/descrizione.json' });

  if (data.malefatte.tabella_crimini) {
    writeJSON(malDir, 'tabella_crimini.json', data.malefatte.tabella_crimini);
    index.sezioni.push({ nome: 'Tabella Crimini', path: 'malefatte/tabella_crimini.json' });
  }
  if (data.malefatte.modificatori_malefatte) {
    writeJSON(malDir, 'modificatori.json', data.malefatte.modificatori_malefatte);
    index.sezioni.push({ nome: 'Modificatori Malefatte', path: 'malefatte/modificatori.json' });
  }
}

// Taglia
if (data.taglia) {
  const tagliaDir = path.join(target, 'taglia');
  writeJSON(tagliaDir, 'descrizione.json', {
    descrizione: data.taglia.descrizione,
    calcolo: data.taglia.calcolo,
    malefatte_to_taglia: data.taglia.malefatte_to_taglia || null,
    fonte: data.fonte
  });
  index.sezioni.push({ nome: 'Taglia - Base', path: 'taglia/descrizione.json' });

  if (data.taglia.livelli_taglia) {
    writeJSON(tagliaDir, 'livelli.json', data.taglia.livelli_taglia);
    index.sezioni.push({ nome: 'Livelli Taglia', path: 'taglia/livelli.json' });
  }
  if (data.taglia.reazione_autorita) {
    writeJSON(tagliaDir, 'reazioni_autorita.json', data.taglia.reazione_autorita);
    index.sezioni.push({ nome: 'Reazioni Autorità', path: 'taglia/reazioni_autorita.json' });
  }
}

// Nomea
if (data.nomea) {
  const nomeaDir = path.join(target, 'nomea');
  writeJSON(nomeaDir, 'descrizione.json', {
    descrizione: data.nomea.descrizione,
    progressione: data.nomea.progressione,
    benefici: data.nomea.benefici,
    fonte: data.fonte
  });
  index.sezioni.push({ nome: 'Nomea', path: 'nomea/descrizione.json' });
}

// Tabelle aggiuntive
if (data.magistrati) {
  writeJSON(target, 'magistrati.json', data.magistrati);
  index.sezioni.push({ nome: 'Magistrati', path: 'magistrati.json' });
}
if (data.servizi) {
  writeJSON(target, 'servizi.json', data.servizi);
  index.sezioni.push({ nome: 'Servizi', path: 'servizi.json' });
}
if (data.carcere) {
  writeJSON(target, 'carcere.json', data.carcere);
  index.sezioni.push({ nome: 'Carcere', path: 'carcere.json' });
}

writeJSON(target, 'index.json', index);

console.log('Sistema Malefatte/Taglia suddiviso in', target);
