# 🎯 STRATEGIA MULTI-AGENT PER REVISIONE PROFONDA BRANCALONIA

## ❌ ERRORI CRITICI IDENTIFICATI
- Rimozione contenuti invece di implementazione meccaniche
- Fix superficiali senza comprensione struttura D&D 5e
- Mancanza di test e validazione reale
- RollTable vuote (struttura presente ma non caricata)
- Classi con visualizzazione parziale
- Spell e advancement per livello mancanti
- Collegamenti item errati/mancanti

## 🤖 STRUTTURA AGENT PROPOSTA (8 Agent Specializzati)

### 1. **AGENT MONITOR** - Sorveglianza Repository D&D 5e
- **Compito**: Monitorare github.com/foundryvtt/dnd5e per updates
- **Output**: Report tecnici su strutture e fix
- **Frequenza**: Check giornaliero
- **Strumenti**: GitHub API, diff analysis

### 2. **AGENT VALIDATOR** - Test e Validazione
- **Compito**: Creare suite di test per ogni compendium
- **Validazioni**:
  - JSON structure validation
  - Field requirements per item type
  - Cross-reference validation (UUID esistenti)
  - In-game loading test
- **Output**: Report errori dettagliati

### 3. **AGENT DATABASE** - Gestione Database Completo
- **Compito**: Mantenere integrità database locale
- **Focus**:
  - Mappatura completa item esistenti
  - Generazione UUID corretti
  - Collegamenti tra item (spell, features, equipment)
- **Output**: Database map JSON aggiornato

### 4. **AGENT CLASSES** - Specialista Classi
- **Compito**: Implementare TUTTE le meccaniche delle classi
- **Requisiti**:
  - Advancement per ogni livello (1-20)
  - Spell slots progression
  - Class features come ItemGrant
  - Subclass choice points
- **NON rimuovere contenuti, solo aggiungere/correggere**

### 5. **AGENT SPELLS** - Gestione Incantesimi
- **Compito**: Creare/verificare tutti gli incantesimi
- **Focus**:
  - Traduzione spell da SRD
  - Spell lists per classe
  - Rituali e componenti
  - Scaling per livello
- **Output**: Compendium spell completo

### 6. **AGENT ROLLTABLES** - Fix RollTable
- **Compito**: Popolare TUTTE le RollTable vuote
- **Problema**: Struttura presente ma results[] vuoto
- **Soluzione**:
  - Analizzare formato results corretto
  - Popolare da database locale
  - Verificare draw functionality

### 7. **AGENT FEATURES** - Features e Advancement
- **Compito**: Creare tutti i class/race features mancanti
- **Focus**:
  - Feature per ogni livello classe
  - Racial traits come item
  - Background features
  - Active Effects corretti
- **Collegamento con AGENT CLASSES**

### 8. **AGENT UI** - Testing Interfaccia
- **Compito**: Verificare visualizzazione in-game
- **Test**:
  - Character sheet population
  - Advancement application
  - Drag & drop functionality
  - Compendium browser
- **Output**: Screenshot e bug report

## 📋 PROCESSO OPERATIVO

### FASE 1: ANALISI (NO MODIFICHE)
1. AGENT MONITOR analizza struttura D&D 5e ufficiale
2. AGENT VALIDATOR crea test suite
3. AGENT DATABASE mappa tutto l'esistente

### FASE 2: RIPRISTINO
1. Ripristinare TUTTI i contenuti rimossi
2. Mantenere database locale intatto
3. Backup completo prima di modifiche

### FASE 3: IMPLEMENTAZIONE COORDINATA
```
AGENT CLASSES + AGENT FEATURES → Class improvements
AGENT SPELLS → Spell compendium
AGENT ROLLTABLES → Table population
AGENT DATABASE → UUID management
```

### FASE 4: VALIDAZIONE
1. AGENT VALIDATOR esegue test suite
2. AGENT UI verifica in-game
3. Fix iterativi basati su errori reali

## 🛠 STRUMENTI DA RICERCARE

### Sviluppo
- [ ] Foundry CLI extensions
- [ ] D&D 5e module template generators
- [ ] JSON schema validators per Foundry
- [ ] Automated testing frameworks

### Conversione
- [ ] D&D Beyond → Foundry converters
- [ ] SRD data extractors
- [ ] Translation automation tools

### Monitoring
- [ ] GitHub webhook integration
- [ ] Diff visualization tools
- [ ] Version tracking systems

## 📊 METRICHE REALI (NO PERCENTUALI FALSE)

### Da tracciare:
- Numero errori di validazione per compendium
- Item con UUID mancanti/errati
- Features senza Active Effects
- RollTable con results vuoti
- Classi senza advancement completi
- Test falliti vs passati

### NON dichiarare:
- Percentuali di completamento inventate
- "100% compatibile" senza test reali
- "Fix completo" senza validazione

## 🚫 REGOLE FERREE

1. **MAI rimuovere contenuti** - solo aggiungere/correggere
2. **Test prima di commit** - nessuna modifica senza validazione
3. **Documentazione tecnica** - ogni scoperta nel README
4. **Backup incrementali** - prima di ogni modifica massiva
5. **Coordinamento agent** - nessuna modifica isolata
6. **Verifica in-game** - ogni fix deve essere testato in Foundry
7. **Monitoraggio upstream** - allineamento con D&D 5e ufficiale
8. **Trasparenza errori** - documentare cosa NON funziona

## 🔄 CICLO DI SVILUPPO

```
1. ANALYZE → Capire problema reale
2. PLAN → Strategia coordinata multi-agent
3. IMPLEMENT → Modifiche incrementali
4. TEST → Validazione completa
5. DOCUMENT → Aggiornamento tecnico README
6. ITERATE → Basato su feedback reali
```

## ⚠️ PRIORITÀ IMMEDIATE

1. **STOP modifiche distruttive**
2. **Ripristinare contenuti rimossi**
3. **Analizzare struttura RollTable corretta**
4. **Mappare TUTTI gli advancement mancanti**
5. **Creare test suite di base**
6. **Documentare struttura reale D&D 5e**

---

**NOTA**: Questo documento sostituisce l'approccio superficiale precedente. Ogni agent deve operare secondo queste linee guida senza eccezioni.