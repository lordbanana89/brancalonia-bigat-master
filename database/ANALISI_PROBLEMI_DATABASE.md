# 🔍 ANALISI PROBLEMI DATABASE ATTUALE

## ❌ PROBLEMI IDENTIFICATI

### 1. FILE AGGLOMERATI (DA DIVIDERE)

```
⚠️ File con più elementi che vanno divisi in file singoli:

- razze/dettagli/TUTTE_RAZZE_COMPLETE.json (298 righe)
  → Deve diventare: 6 file singoli per razza

- regole/SISTEMA_RISSA_COMPLETO.json (322 righe)
  → Deve diventare: cartella rissa/ con file separati per ogni mossa

- regole/SISTEMA_MALEFATTE_TAGLIA_COMPLETO.json (344 righe)
  → Deve diventare: cartella malefatte_taglia/ con file modulari

- classi/dettagli/pagano_barbaro_COMPLETO.json (178 righe)
  → Deve diventare: cartella con privilegi separati

- macaronicon/png_mostri/TUTTI_PNG_MOSTRI.json (319 righe)
  → Deve diventare: file singoli per ogni PNG e mostro

- macaronicon/espansioni_tematiche/TUTTE_ESPANSIONI.json (282 righe)
  → Deve diventare: cartella con ogni espansione separata

- macaronicon/equipaggiamento/CIARPAME_MAGICO.json (246 righe)
  → Deve diventare: 18 file singoli

- macaronicon/equipaggiamento/TUTTO_EQUIPAGGIAMENTO.json (205 righe)
  → Deve diventare: file singoli per ogni oggetto

- macaronicon/avventure/TUTTE_AVVENTURE.json (244 righe)
  → Deve diventare: 12 cartelle, una per avventura

- macaronicon/incantesimi/TUTTI_INCANTESIMI.json (223 righe)
  → Deve diventare: file singoli per incantesimo

- macaronicon/backgrounds/TUTTI_BACKGROUNDS.json
  → Deve diventare: 8 file singoli

// ✓ macaronicon/sottoclassi/DETTAGLIO_TUTTE_SOTTOCLASSI.json
//    Rimosso: sostituito da index + file numerati

// ✓ macaronicon/sottoclassi/TUTTE_SOTTOCLASSI.json
//    Rimosso: ora esistono 10 file singoli + index
```

### 2. CONTENUTI MANCANTI

```
❌ NON ANCORA ESTRATTI DAL MANUALE BASE:

- 11 classi su 12 (manca tutto tranne Pagano)
- TUTTI gli incantesimi del manuale base
- Liste incantesimi per classe
- Tabelle di progressione complete
- Sistema combattimento completo
- Regole esplorazione
- Tabelle incontri casuali
- Tesori e ricompense
- PNG del manuale base
- Condizioni e stati alterati
- Equipaggiamento comune non magico
- Prezzi e economia
- Regole su prove e competenze
- Regole morte e guarigione

❌ INCOMPLETI DAL MACARONICON:

- Dettagli meccanici di alcune sottoclassi
- Sistema navale completo
- Sistema duelli
- Tabelle casuali espansioni
- PNG con statistiche complete
- Luoghi e mappe
```

### 3. STRUTTURA ERRATA

```
⚠️ PROBLEMI STRUTTURALI:

1. Mancano quasi tutti gli index.json
2. File non seguono naming convention (id_nome.json)
3. Cartelle non organizzate gerarchicamente
4. Nessuna separazione tra meccaniche e narrativa
5. Mancano metadati di validazione
```

### 4. FILE DA ELIMINARE

```
🗑️ DA RIMUOVERE DOPO MIGRAZIONE:

- Tutti i file TUTTI_*
- Tutti i file TUTTE_*
- Tutti i file *_COMPLETO
- Tutti i file *_COMPLETE
- File di script temporanei (split_*.mjs)
```

## 📊 STATISTICHE ATTUALI

```yaml
File totali: 72
File corretti: ~52 (cimeli già divisi)
File da dividere: ~20
File mancanti stimati: 500+

Aggiornamenti:
- Classe Pagano/Barbaro: split in directory dedicata (aprile 2024)
- Sistema Risse: sezioni separate con index (aprile 2024)
- Sistema Malefatte/Taglia: sezioni separate con index (aprile 2024)
- Razze base: cartelle dedicate con index (aprile 2024)
- Intrugli: file singoli + index (aprile 2024)
- Avventure Macaronicon: 12 cartelle dedicate (aprile 2024)
- Espansioni Macaronicon: cartelle dedicate (aprile 2024)
- PNG e Mostri Macaronicon: categorie+index (aprile 2024)
- Backgrounds Macaronicon: 8 file singoli + index (aprile 2024)
- Sottoclassi Macaronicon: 10 file singoli + index (aprile 2024)
- Incantesimi Macaronicon: suddivisi per livello con index (aprile 2024)
- Ciarpame magico Macaronicon: tutti gli oggetti in file singoli (aprile 2024)

Copertura contenuti:
- Manuale Base: ~15%
- Macaronicon: ~25%
- Totale: ~20%

Struttura:
- File singoli: ~70% (cimeli + background + incantesimi + ciarpame)
- File agglomerati: ~30%
- Index presenti: backgrounds base/mac, sottoclassi mac, incantesimi mac, ciarpame magico, classi/pagano (da estendere)
```

## 🔧 PIANO DI AZIONE

### FASE 1: DIVIDERE FILE ESISTENTI
1. ✅ Cimeli (FATTO - 50 file)
2. ⬜ Razze base (6 file)
3. ✅ Backgrounds base (6 file)
4. ✅ Backgrounds Macaronicon (8 file)
5. ✅ Sottoclassi Macaronicon (10 file)
6. ✅ Ciarpame magico Macaronicon (18 file)
7. ✅ Incantesimi Macaronicon (20 file)
8. ⬜ PNG e mostri (~50 file)
9. ⬜ Sistema Rissa (mosse separate)
10. ⬜ Sistema Malefatte (componenti separati)

### FASE 2: ESTRARRE CONTENUTI MANCANTI
1. ⬜ 11 classi base complete
2. ⬜ Tutti gli incantesimi base
3. ⬜ Sistema combattimento
4. ⬜ Tabelle varie
5. ⬜ Equipaggiamento comune
6. ⬜ PNG manuale base

### FASE 3: CREARE STRUTTURA CORRETTA
1. ⬜ Creare tutti gli index.json
2. ⬜ Rinominare file con ID
3. ⬜ Organizzare cartelle gerarchicamente
4. ⬜ Aggiungere metadati validazione

### FASE 4: VALIDAZIONE
1. ⬜ Verificare completezza
2. ⬜ Testare caricamento
3. ⬜ Validare meccaniche
4. ⬜ Cross-reference con manuali

## 🚨 CRITICITÀ

1. **Il 80% del contenuto non è ancora stato estratto**
2. **La struttura attuale non è scalabile**
3. **File agglomerati rendono impossibile il versionamento granulare**
4. **Mancano completamente le classi base (cuore del gioco)**
5. **Sistema incantesimi completamente assente**

## 💡 RACCOMANDAZIONI

1. **STOP** a creare file agglomerati
2. **PRIORITÀ** a dividere file esistenti
3. **FOCUS** su estrazione sistematica classe per classe
4. **AUTOMAZIONE** con script per divisione file
5. **VALIDAZIONE** continua durante estrazione

---

*Il database è utilizzabile al 20% - Richiede ristrutturazione completa*
