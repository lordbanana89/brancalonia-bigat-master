# Piano di Standardizzazione e Collegamenti - Versione 3.12.0

## VALIDAZIONE CONTENUTI

### Manuali Disponibili nel Progetto:
1. `manuale_brancalonia.txt` - Manuale base
2. `Brancalonia-Macaronicon-ITA-2-2.txt` - Espansione con Burattinaio
3. `manual_personaggi.txt` - Dettagli personaggi
4. `manual_risse.txt` - Sistema risse
5. `manual_riposo.txt` - Regole riposo
6. `manual_malefatte.txt` - Sistema malefatte
7. `manual_avanzamento.txt` - Avanzamento personaggi
8. `manual_giochi.txt` - Giochi d'azzardo
9. `manual_emeriticenze.txt` - Sistema emeriticenze

### Contenuti Verificati:
- **Armi da Fuoco**: Le armi ESISTONO nei compendi (archibugio, pistola, moschetto)
  - Mancano solo: bombarda tascabile e trombone da guerra
- **Sistema Batoste**: Confermato per le risse (6 livelli)
- **Menagramo**: Patrono Warlock confermato
- **Classi Knave/Straccione**: Da verificare in altri manuali supplementari

## PROBLEMI IDENTIFICATI

### 1. Collegamenti Mancanti tra Regole e Oggetti

#### Oggetti MANCANTI citati nelle regole:
- `bombardatascabile001` - Bombarda Tascabile ❌ Citata nelle regole ma manca nel compendio
- `trombonedaguerra001` - Trombone da Guerra ❌ Citato nelle regole ma manca nel compendio

#### Oggetti ESISTENTI nei compendi:
- `archibugiomalfunzionante001` - Archibugio ✅ Esiste
- `pistolascadente001` - Pistola ✅ Esiste
- `moschettoarrugginito001` - Moschetto ✅ Esiste

#### UUID con ID Errati nelle Regole:
```
Regola armi-da-fuoco-primitive.json contiene:
- @UUID[Compendium.brancalonia-bigat.equipaggiamento.bombardatascabile001] ❌ Non esiste
- @UUID[Compendium.brancalonia-bigat.equipaggiamento.trombonedaguerra001] ❌ Non esiste
```

### 2. Inconsistenze Terminologiche

#### Condizioni e Terminologia Confermata dai Manuali:
- **Menagramo**: ✅ CANONICO come Patrono Warlock (manuale base)
  - Problema: anche usato come condizione custom (ridondante)
- **Batosta**: ✅ CANONICO come sistema risse (6 livelli, manuale base)
  - Problema: implementazione come condizione separata non chiara
- **Ubriaco**: ⚠️ Citato nel Macaronicon ma non come condizione ufficiale
  - Problema: implementato come condizione e regola separate

#### Talenti con Nomi Inconsistenti:
- Manuale dice "Supercazzola" → File è "talent_supercazzola" ✅
- Manuale dice "Nostalgia di Malebolge" → File è "talent_nostalgia_malebolge" ✅
- Alcuni talenti usano prefisso "talent_" altri no (inconsistente)

#### Nomi Oggetti Inconsistenti:
- Regola dice "Archibugio" → File è "archibugio-malfunzionante.json"
- Regola dice "Pistola" → File è "pistola-scadente.json"
- Regola dice "Moschetto" → File è "moschetto-arrugginito.json"

### 3. Collegamenti Unidirezionali
- Le regole linkano agli oggetti ma gli oggetti NON linkano alle regole
- Nessun sistema di back-reference per sapere quali regole parlano di un oggetto

### 4. Mancanza di Standardizzazione ID
- Alcuni usano camelCase: `archibugiomalfunzionante001`
- Altri usano kebab-case nei file: `archibugio-malfunzionante.json`
- Confusione tra ID interno e nome file

### 5. Contenuti Mancanti dai Manuali NON Implementati

#### Dal Macaronicon:
- **Classe Burattinaio**: Presente nel Macaronicon ma NON nei compendi
- **Tradizioni del Burattinaio**: Mancano completamente
- **Privilegi specifici**: Occhi di Gatto, Svanizione, Pantemima

#### Sottoclassi Citate ma Non Chiare:
- **Miracolari**: Citati come personaggi ma non come sottoclasse chiara
- **Guiscardi**: Menzionati ma implementazione non chiara
- **Arlecchino**: Presente come maschera ma sottoclasse incompleta

## SOLUZIONE PROPOSTA - VERSIONE 3.12.0

### SOLUZIONE IMMEDIATA: Correggere Collegamenti e Completare Contenuti

### FASE 1: Creazione Oggetti Mancanti PRIORITARI

#### 1.1 Aggiungere al compendio equipaggiamento:
```json
// bombarda-tascabile.json
{
  "_id": "bombardatascabile001",
  "name": "Bombarda Tascabile",
  "type": "weapon",
  "system": {
    "damage": { "parts": [["2d4", "fire"]] },
    "range": { "value": 15, "long": 30 },
    "properties": ["amm", "lod", "spc"],
    "description": {
      "value": "<p>Piccola arma da fuoco che spara proiettili esplosivi in area.</p>",
      "richTooltip": {
        "content": "<p>Area 5 piedi, caricamento (3 turni)</p>"
      }
    }
  }
}

// trombone-da-guerra.json
{
  "_id": "trombonedaguerra001",
  "name": "Trombone da Guerra",
  "type": "weapon",
  "system": {
    "damage": { "parts": [["2d8", "piercing"]] },
    "range": { "value": 15, "long": 30 },
    "properties": ["amm", "lod", "two"],
    "description": {
      "value": "<p>Arma da fuoco primitiva che spara pallettoni in cono.</p>",
      "richTooltip": {
        "content": "<p>Cono 15 piedi, caricamento (2 turni)</p>"
      }
    }
  }
}
```

### FASE 2: Standardizzazione Nomi e ID

#### 2.1 Mappatura Completa ID → Nome
```javascript
const itemMapping = {
  // Armi da Fuoco
  "archibugiomalfunzionante001": "Archibugio Malfunzionante",
  "pistolascadente001": "Pistola Scadente",
  "moschettoarrugginito001": "Moschetto Arrugginito",
  "bombardatascabile001": "Bombarda Tascabile",
  "trombonedaguerra001": "Trombone da Guerra",

  // Altri Equipaggiamenti citati nelle regole
  "daditruccati001": "Dadi Truccati",
  "cartesegnate001": "Carte Segnate",

  // Condizioni
  "menagramo": "Condizione Menagramo",
  "batosta": "Condizione Batosta",
  "ubriaco": "Condizione Ubriaco"
};
```

### FASE 3: Sistema di Collegamenti Bidirezionali

#### 3.1 Aggiungere campo "relatedRules" agli oggetti
```json
// In ogni oggetto del compendio equipaggiamento
{
  "_id": "archibugiomalfunzionante001",
  "flags": {
    "brancalonia-bigat": {
      "relatedRules": [
        "armiDaFuocoPrimitive001",
        "equipaggiamentoScadente001"
      ]
    }
  }
}
```

#### 3.2 Aggiungere campo "relatedItems" alle regole
```json
// In ogni regola
{
  "_id": "armiDaFuocoPrimitive001",
  "flags": {
    "brancalonia-bigat": {
      "relatedItems": [
        "archibugiomalfunzionante001",
        "pistolascadente001",
        "moschettoarrugginito001",
        "bombardatascabile001",
        "trombonedaguerra001"
      ]
    }
  }
}
```

### FASE 4: Script di Migrazione Automatica

#### 4.1 Script per correggere tutti i collegamenti
```javascript
// fix-all-links.js
const fixAllLinks = async () => {
  // 1. Scansiona tutte le regole
  // 2. Trova tutti gli UUID
  // 3. Verifica che esistano
  // 4. Correggi quelli rotti
  // 5. Aggiungi collegamenti bidirezionali
  // 6. Ricompila i database
};
```

### FASE 5: Sistema di Validazione e Documentazione

#### 5.1 Script di validazione pre-build
```javascript
// validate-links.js
const validateLinks = () => {
  // Verifica che tutti gli UUID nelle regole puntino a oggetti esistenti
  // Verifica che tutti gli oggetti citati abbiano back-reference
  // Verifica consistenza dei nomi
  // Separa contenuto canonico da homebrew
  // Report degli errori trovati
};
```

#### 5.2 Documentazione Contenuto
```javascript
// content-manifest.json
{
  "canonical": {
    "razze": [/* dal manuale base */],
    "talenti": [/* dal manuale base */],
    "condizioni": ["batosta", "menagramo"]
  },
  "homebrew": {
    "classi": ["knave", "straccione"],
    "armi": ["archibugio", "pistola", "moschetto", "bombarda", "trombone"],
    "regole": ["armi-da-fuoco-primitive"]
  }
}
```

## IMPLEMENTAZIONE STEP-BY-STEP

### Step 1: Backup (IMMEDIATO)
```bash
cp -r packs packs_backup_3.11.5
git add -A && git commit -m "Backup pre-migrazione v3.12.0"
```

### Step 2: Creazione Oggetti Mancanti (30 min)
- [ ] Creare bombarda-tascabile.json
- [ ] Creare trombone-da-guerra.json
- [ ] Aggiungere richTooltip a tutti i nuovi oggetti

### Step 3: Fix Collegamenti Esistenti (1 ora)
- [ ] Correggere tutti gli UUID nelle regole
- [ ] Aggiungere relatedRules agli oggetti
- [ ] Aggiungere relatedItems alle regole

### Step 4: Standardizzazione Condizioni (30 min)
- [ ] Disambiguare "Menagramo" (condizione vs sottoclasse vs regola)
- [ ] Collegare condizione Batosta con regole risse
- [ ] Collegare condizione Ubriaco con regole ubriachezza

### Step 5: Testing e Validazione (30 min)
- [ ] Eseguire script di validazione
- [ ] Test manuale in Foundry
- [ ] Verificare tutti i tooltip funzionanti
- [ ] Verificare tutti i link cliccabili

### Step 6: Documentazione (15 min)
- [ ] Aggiornare README con v3.12.0
- [ ] Documentare nuova struttura collegamenti
- [ ] Aggiungere esempi d'uso

## RISULTATI ATTESI

### Dopo l'implementazione:
1. **100% dei collegamenti funzionanti** tra regole e oggetti
2. **Navigazione bidirezionale** completa
3. **Nomi standardizzati** e consistenti
4. **Nessun errore** nei tooltip o link
5. **Sistema validazione** automatica per futuri aggiornamenti

## METRICHE DI SUCCESSO

- [ ] 0 errori UUID nei compendi
- [ ] 100% oggetti citati nelle regole esistono
- [ ] 100% oggetti hanno back-reference alle regole
- [ ] 0 warning nella console di Foundry
- [ ] Test utente: navigazione fluida tra regole e oggetti

## NOTE PER LA VERSIONE 3.12.0

### Note Implementazione:
- Tutti i contenuti devono funzionare correttamente
- Collegamenti bidirezionali tra regole e oggetti
- Standardizzazione completa di ID e nomi

### Breaking Changes:
- Alcuni ID potrebbero cambiare (documentare per utenti esistenti)
- Necessario reimportare i compendi
- Aggiunta flag "isHomebrew" per contenuti non canonici

### Nuove Features:
- Sistema collegamenti bidirezionali
- Validazione automatica integrità
- Navigazione migliorata tra contenuti

### Migration Path:
- Script di migrazione automatica per mondi esistenti
- Backup automatico pre-migrazione
- Rollback possibile se necessario

## RACCOMANDAZIONI FINALI

### Priorità IMMEDIATE (v3.12.0):
1. **CREARE** oggetti mancanti citati nelle regole (bombarda, trombone)
2. **CORREGGERE** tutti i collegamenti rotti
3. **STANDARDIZZARE** tutti gli ID e nomi
4. **IMPLEMENTARE** collegamenti bidirezionali
5. **VALIDARE** che tutto funzioni correttamente

### Priorità FUTURE (v3.13.0+):
1. **IMPLEMENTARE** classe Burattinaio dal Macaronicon
2. **CHIARIRE** sottoclassi Miracolari, Guiscardi, Arlecchino
3. **AGGIUNGERE** contenuti mancanti dai manuali
4. **CREARE** sistema di toggle per contenuto homebrew

### Validazione Contenuti - SINTESI:
- ✅ **Contenuti Funzionanti**: Razze, Talenti, Sistema Batoste, Menagramo, Armi base
- ❌ **Contenuti Mancanti**: Bombarda tascabile, Trombone da guerra
- ⚠️ **Collegamenti Rotti**: UUID nelle regole che puntano a oggetti inesistenti
- 📝 **Da Implementare**: Classe Burattinaio dal Macaronicon

---

**Tempo Stimato Totale**: 3 ore
**Priorità**: CRITICA
**Versione Target**: 3.12.0