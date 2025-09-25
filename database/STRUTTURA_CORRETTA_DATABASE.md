# 🏗️ STRUTTURA CORRETTA DEL DATABASE BRANCALONIA

## ⚠️ PRINCIPI FONDAMENTALI

1. **NESSUN FILE AGGLOMERATO**: Mai mettere più elementi nello stesso file
2. **UN FILE PER ELEMENTO**: Ogni razza, classe, oggetto = un file separato
3. **FILE INDEX.JSON**: Ogni cartella ha un index.json che lista i contenuti
4. **NAMING CONVENTION**: `id_nome_elemento.json` (es: `001_anello_vescovo.json`)
5. **STRUTTURA MODULARE**: Facile aggiungere/rimuovere elementi

## 📁 STRUTTURA DIRECTORY CORRETTA

```
database/
├── index.json                      # Indice principale del database
│
├── razze/
│   ├── index.json                  # Lista delle 6 razze base
│   ├── 001_umano.json
│   ├── 002_dotato.json
│   ├── 003_morgante.json
│   ├── 004_selvatico.json
│   ├── 005_malebranche.json
│   └── 006_marionetta.json
│       ├── sottorazze/
│       │   ├── index.json
│       │   ├── 001_pinocchio.json
│       │   └── 002_pupo.json
│
├── classi/
│   ├── index.json                  # Lista delle 12 classi
│   ├── 001_pagano_barbaro/
│   │   ├── index.json
│   │   ├── progressione.json
│   │   ├── privilegi/
│   │   │   ├── index.json
│   │   │   ├── livello_01_ira.json
│   │   │   ├── livello_01_difesa_senza_armatura.json
│   │   │   ├── livello_02_attacco_irruento.json
│   │   │   └── ... (ogni privilegio in file separato)
│   │   └── sottoclassi/
│   │       ├── index.json
│   │       ├── berserker.json
│   │       └── totem.json
│   ├── 002_arlecchino_bardo/
│   │   └── (stessa struttura)
│   └── ... (altre classi)
│
├── backgrounds/
│   ├── index.json
│   ├── 001_ambulante.json
│   ├── 002_attaccabrighe.json
│   ├── 003_azzeccagarbugli.json
│   ├── 004_brado.json
│   ├── 005_duro.json
│   └── 006_fuggitivo.json
│
├── talenti/
│   ├── index.json
│   ├── 001_anima_contadina.json
│   ├── 002_antica_arte_culinaria.json
│   └── ... (8 talenti totali)
│
├── emeriticenze/
│   ├── index.json
│   ├── 001_affinamento.json
│   ├── 002_arma_preferita.json
│   └── ... (11 emeriticenze totali)
│
├── equipaggiamento/
│   ├── index.json
│   ├── armi/
│   │   ├── index.json
│   │   ├── 001_forcone_arme.json
│   │   └── ...
│   ├── armature/
│   │   ├── index.json
│   │   └── ...
│   ├── oggetti_comuni/
│   │   ├── index.json
│   │   └── ...
│   ├── intrugli/
│   │   ├── index.json
│   │   ├── 001_acquamorte.json
│   │   └── ... (11 intrugli)
│   ├── ciarpame_magico/
│   │   ├── index.json
│   │   ├── 001_anello_desiderio_estinto.json
│   │   └── ... (15 oggetti)
│   └── cimeli/
│       ├── index.json              ✅ GIÀ FATTO
│       ├── 001_anello_vescovo.json ✅ GIÀ FATTO
│       └── ... (50 cimeli)        ✅ GIÀ FATTO
│
├── incantesimi/
│   ├── index.json
│   ├── per_classe/
│   │   ├── index.json
│   │   ├── chierico.json
│   │   ├── mago.json
│   │   └── ...
│   └── dettagli/
│       ├── index.json
│       ├── livello_0/
│       │   ├── index.json
│       │   ├── 001_prestidigitazione.json
│       │   └── ...
│       └── livello_1/
│           ├── index.json
│           ├── 001_armatura_magica.json
│           └── ...
│
├── regole/
│   ├── index.json
│   ├── combattimento/
│   │   ├── index.json
│   │   ├── iniziativa.json
│   │   ├── azioni.json
│   │   ├── reazioni.json
│   │   └── condizioni.json
│   ├── rissa/
│   │   ├── index.json
│   │   ├── regole_base.json
│   │   ├── livelli_batoste.json
│   │   ├── mosse/
│   │   │   ├── index.json
│   │   │   ├── 001_saccagnata.json
│   │   │   └── ...
│   │   └── oggetti_rissa.json
│   ├── malefatte_taglia/
│   │   ├── index.json
│   │   ├── sistema_malefatte.json
│   │   ├── sistema_taglia.json
│   │   ├── sistema_nomea.json
│   │   └── tabelle_crimini.json
│   └── esplorazione/
│       ├── index.json
│       ├── viaggio.json
│       ├── riposo.json
│       └── incontri_casuali.json
│
├── macaronicon/
│   ├── index.json
│   ├── razze/
│   │   ├── index.json
│   │   ├── 001_gatto_lupesco.json
│   │   ├── 002_inesistente.json
│   │   └── 003_pantegano.json
│   ├── sottoclassi/
│   │   ├── index.json
│   │   ├── 001_montanaro_barbaro.json
│   │   ├── 002_guappo_bardo.json
│   │   └── ... (10 sottoclassi)
│   ├── backgrounds/
│   │   ├── index.json
│   │   ├── 001_bargello.json
│   │   └── ... (8 backgrounds)
│   ├── equipaggiamento/
│   │   └── (struttura come sopra)
│   ├── incantesimi/
│   │   └── (struttura come sopra)
│   ├── avventure/
│   │   ├── index.json
│   │   ├── 001_locanda_gatto_nero/
│   │   │   ├── index.json
│   │   │   ├── trama.json
│   │   │   ├── png.json
│   │   │   ├── luoghi.json
│   │   │   └── ricompense.json
│   │   └── ... (12 avventure)
│   └── png_mostri/
│       ├── index.json
│       ├── png/
│       │   ├── index.json
│       │   ├── 001_gabelliere_corrotto.json
│       │   └── ...
│       └── mostri/
│           ├── index.json
│           ├── 001_cane_infernale.json
│           └── ...
│
└── tabelle/
    ├── index.json
    ├── tesori.json
    ├── incontri_casuali.json
    └── nomi_png.json
```

## 📋 FORMATO STANDARD FILE

### index.json
```json
{
  "categoria": "Nome Categoria",
  "descrizione": "Breve descrizione",
  "totale": 10,
  "fonte": "Manuale di riferimento",
  "elementi": [
    {
      "id": "001",
      "nome": "Nome Elemento",
      "file": "001_nome_elemento.json",
      "tipo": "tipo_elemento"
    }
  ]
}
```

### Elemento Singolo (es: razza, classe, oggetto)
```json
{
  "id": "001",
  "nome": "Nome Elemento",
  "categoria": "Categoria",
  "fonte": "Manuale p.XX",
  "descrizione": "Descrizione completa",
  "meccaniche": {
    // Dettagli meccanici
  },
  "implementazione": {
    "tipo": "attivo/passivo/narrativo",
    "active_effects": [],
    "flags": {}
  },
  "validazione": {
    "completo": true,
    "testato": false,
    "note": ""
  }
}
```

## ✅ VANTAGGI DI QUESTA STRUTTURA

1. **Modularità**: Ogni elemento è indipendente
2. **Scalabilità**: Facile aggiungere nuovi contenuti
3. **Manutenibilità**: Modifiche isolate per elemento
4. **Versionamento**: Git traccia meglio le modifiche
5. **Performance**: Carica solo i file necessari
6. **Ricercabilità**: Facile trovare elementi specifici
7. **Automazione**: Script possono processare file singoli
8. **Validazione**: Ogni file può essere validato indipendentemente

## 🔧 SCRIPT DI MIGRAZIONE

Per convertire i file agglomerati esistenti:

```javascript
// split_aggregated.mjs
import fs from 'fs';
import path from 'path';

function splitAggregatedFile(inputFile, outputDir, extractorFn) {
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const elements = extractorFn(data);

  // Crea directory se non esiste
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Crea index.json
  const index = {
    categoria: data.categoria || 'Categoria',
    fonte: data.fonte,
    totale: elements.length,
    elementi: []
  };

  // Crea file individuali
  elements.forEach((element, i) => {
    const id = String(i + 1).padStart(3, '0');
    const filename = `${id}_${sanitizeFilename(element.nome)}.json`;

    index.elementi.push({
      id,
      nome: element.nome,
      file: filename
    });

    fs.writeFileSync(
      path.join(outputDir, filename),
      JSON.stringify(element, null, 2)
    );
  });

  // Salva index
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
}
```

## 🚫 FILE DA ELIMINARE

Dopo la migrazione, eliminare TUTTI i file con pattern:
- `*TUTTI_*`
- `*TUTTE_*`
- `*COMPLETO*`
- `*COMPLETE*`
- Qualsiasi file che contiene più di un elemento

## 📊 STATO ATTUALE

- ✅ **Cimeli**: Già divisi in 50 file singoli
- ⬜ **Razze**: Cartelle create (index), completare sottorazze/dettagli
- ⬜ **Classi**: Struttura avviata (pagano/barbaro); restanti classi da migrare
- ✅ **Backgrounds (base + Macaronicon)**: file singoli + index
- ✅ **Sottoclassi (Macaronicon)**: 10 file singoli + index completati
- ⬜ **Incantesimi**: Dettagli Macaronicon completati (restano liste per classe e manuale base)
- ⬜ **Equipaggiamento**: Ciarpame + intrugli completati; restano armi/armature/oggetti comuni
- ✅ **PNG/Mostri**: Cartelle per categorie complete
- ✅ **Avventure**: 12 cartelle dedicate

## 🎯 PROSSIMI PASSI

1. Eseguire migrazione per tutti i file agglomerati
2. Verificare che ogni elemento abbia il suo file
3. Creare tutti gli index.json
4. Eliminare file agglomerati
5. Validare struttura completa
6. Documentare API per accesso ai dati

---

*Questa è la struttura CORRETTA per il database di Brancalonia*
*OGNI elemento DEVE avere il suo file separato*
*MAI aggregare più elementi nello stesso file*
