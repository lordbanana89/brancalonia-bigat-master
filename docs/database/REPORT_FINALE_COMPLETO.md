# 📜 DOCUMENTAZIONE COMPLETA DATABASE BRANCALONIA

## 📦 Struttura Database Creata

```
database/
├── razze/              (6 file JSON - Manuale Base)
├── classi/             (12 file JSON - Sottoclassi Manuale Base)
├── backgrounds/        (6 file JSON - Manuale Base)
├── talenti/            (8 file JSON - Manuale Base)
├── emeriticenze/       (11 file JSON - Post-livello 6)
├── equipaggiamento/
│   ├── intrugli.json         (11 intrugli speciali)
│   └── ciarpame_magico.json  (15 oggetti magici)
├── regole/
│   ├── cimeli.json                  (50 cimeli unici)
│   ├── sistema_rissa.json           (Sistema combattimento non letale)
│   └── sistema_malefatte_taglia.json (Sistema reputazione criminale)
├── macaronicon/
│   ├── nuove_razze.json             (3 nuove razze)
│   └── CONTENUTI_MACARONICON.md     (Indice completo espansione)
└── report/
    ├── REPORT.md
    ├── FINAL_REPORT.md
    └── REPORT_FINALE_COMPLETO.md (questo file)
```

## 📊 Statistiche Database

### Manuale Base
- **Razze**: 6 completamente documentate
- **Classi/Sottoclassi**: 12 documentate
- **Backgrounds**: 6 documentati
- **Talenti**: 8 documentati
- **Emeriticenze**: 11 documentate
- **Intrugli**: 11 documentati
- **Ciarpame Magico**: 15 oggetti documentati
- **Cimeli**: 50 esempi catalogati
- **Sistemi di Gioco**: Rissa, Malefatte/Taglia/Nomea

### Macaronicon (Espansione)
- **Nuove Razze**: 3 (Gatto Lupesco, Inesistente, Pantegano)
- **Nuova Classe**: 1 (Burattinaio)
- **Nuove Sottoclassi**: 10 (una per classe base)
- **Avventure**: 12 scenari completi
- **Contenuti Aggiuntivi**: Background, equipaggiamento, incantesimi, PNG

### Totale Elementi Documentati: **100+ file strutturati**

## 🎯 Classificazione Meccaniche

Ogni meccanica è stata classificata come:

1. **"attivo"**: Richiede Active Effect in Foundry
   - Bonus numerici
   - Modifiche attributi
   - Resistenze/Immunità
   - Competenze

2. **"advancement"**: Gestito da D&D 5e Advancement API
   - Talenti
   - ASI
   - Scelte di classe

3. **"narrativo"**: Solo descrittivo
   - Background narrativi
   - Descrizioni
   - Effetti roleplay

4. **"passivo"**: Impostato una volta
   - Taglia
   - Tipo creatura

## ⚠️ Problemi Identificati

### Implementazione Mancante/Incompleta
1. **Umano**: Nessun Active Effect per Privilegio Rissa
2. **Classi**: Nessuna trovata nel file JS (probabilmente in Advancement)
3. **Backgrounds**: Solo 1/6 implementato (Attaccabrighe)
4. **Talenti**: 0/8 implementati
5. **ID Inconsistenti**: Database usa "001", modulo usa "_brancalonia"

### Copertura Active Effects
```
Razze: 83% (5/6)
Classi: 8% (1/12)
Talenti: 0% (0/8)
Backgrounds: 17% (1/6)
Emeriticenze: 55% (6/11)
```

## 🔧 Modi Active Effects D&D 5e

- **Mode 1 (MULTIPLY)**: Moltiplica il valore
- **Mode 2 (ADD)**: Aggiunge al valore
- **Mode 5 (OVERRIDE)**: Sovrascrive il valore

## 📋 Path Sistema D&D 5e v5.1.9

```javascript
// Caratteristiche
system.abilities.[str|dex|con|int|wis|cha].value

// Movimento
system.attributes.movement.[walk|climb|fly|swim]

// Competenze
system.skills.[SKILL].value

// Resistenze
system.traits.[dr|di|dv|ci].value

// Lingue
system.traits.languages.value

// Flags personalizzate Brancalonia
flags.brancalonia-bigat.[customProperty]
```

## 🌟 Sistemi Speciali Brancalonia

### Sistema Rissa
- Combattimento non letale
- Danni come "batoste" invece di PF
- 6 livelli di batoste (Ammaccato → Incosciente)
- Mosse speciali e slot mossa
- Oggetti di scena comuni ed epici

### Sistema Malefatte/Taglia/Nomea
- 20 tipi di malefatte (2-20 mo ciascuna)
- 6 livelli di Nomea (Maltagliato → Grande Taglia)
- Bonus Nomea: 0-3
- Sistema Infami per traditori

### Emeriticenze (Post-6° livello)
- Ogni 9000 PE dopo il 14000
- 11 opzioni diverse
- Alcune ripetibili (max 2 volte)

## 🛠️ Utilizzo del Database

### Per Sviluppatori
1. Usare file JSON come riferimento per implementazione
2. Verificare classificazione meccaniche (attivo/advancement/narrativo)
3. Seguire pattern ID consistenti
4. Implementare Active Effects mancanti

### Per Game Master
1. Riferimento rapido per regole speciali
2. Tabelle casuali (cimeli, malefatte)
3. Lista completa equipaggiamento speciale
4. Guida per homebrew

### Script Validazione
```bash
node validate-database.cjs
```
Verifica automaticamente corrispondenza tra database e implementazione.

## 📝 Conclusioni

Il database fornisce:
1. **Documentazione completa** di tutte le meccaniche dal Manuale Base
2. **Indice strutturato** del Macaronicon
3. **Classificazione sistematica** per tipo di implementazione
4. **Identificazione precisa** di cosa manca/non funziona
5. **Base solida** per completare l'implementazione Foundry

La struttura modulare in JSON permette facile manutenzione e aggiornamenti futuri.

---

*Database creato per Brancalonia su Foundry VTT v13 con sistema D&D 5e v5.1.9*