# 🎯 BRANCALONIA DEEP REVISION - MULTI-AGENT STRATEGY

## 🔴 SITUAZIONE CRITICA

Il modulo Brancalonia è **NON FUNZIONANTE**:
- ❌ Classi con visualizzazione parziale (0% features caricate)
- ❌ RollTables vuote (0% popolamento)
- ❌ Spell system assente (0 spell)
- ❌ Advancement non compatibili con D&D 5e v5.1.9
- ❌ UUID references rotti (collegamenti item inesistenti)
- ❌ Features senza collegamenti reali

## 🚫 REGOLE FERREE

1. **MAI rimuovere contenuti** - solo aggiungere/correggere
2. **Test prima di commit** - nessuna modifica senza validazione
3. **Documentazione tecnica** - ogni scoperta nel README
4. **NO percentuali false** - solo dati concreti verificabili
5. **Struttura D&D 5e** - conformità 100% con git ufficiale
6. **Modifiche atomiche** - ogni agent un compito specifico

## 🤖 TEAM DI 8 AGENT SPECIALIZZATI

### 1. AGENT_MONITOR 👁️
**Repository**: `scripts/agent-monitor-dnd5e.py`
**Compito**: Monitorare repository D&D 5e ufficiale
- Clona/aggiorna https://github.com/foundryvtt/dnd5e release-5.1.9
- Analizza struttura advancement
- Documenta formato UUID
- Traccia updates in MONITOR_LOG.md

### 2. AGENT_VALIDATOR ✅
**Repository**: `scripts/agent-validator.py`
**Compito**: Test suite completo
- Test JSON structure
- Test advancement types
- Test UUID references
- Test spell slots
- Test RollTable population
- Output: validation-report.md

### 3. AGENT_DATABASE 🗄️
**Repository**: `scripts/agent-database.py`
**Compito**: Normalizzazione database
- Fix _key fields
- Fix _id consistency
- Normalize UUIDs
- Clean duplicates

### 4. AGENT_CLASSES 🎓
**Repository**: `scripts/agent-classes.py`
**Compito**: Fix completo classi
- Implementa TUTTI gli advancement
- Collega features con UUID corretti
- Aggiunge spell progression
- Crea subclass structure

### 5. AGENT_SPELLS 🔮
**Repository**: `scripts/agent-spells.py`
**Compito**: Sistema spell completo
- Importa spell da SRD
- Collega a classi
- Fix spell slots
- Implementa ritual/concentration

### 6. AGENT_ROLLTABLES 🎲
**Repository**: `scripts/agent-rolltables.py`
**Compito**: Popolare RollTables
- Crea results structure
- Popola con dati reali
- Fix range/weight
- Test roll functionality

### 7. AGENT_FEATURES ⚔️
**Repository**: `scripts/agent-features.py`
**Compito**: Features e collegamenti
- Crea TUTTI i feature items
- Fix UUID references
- Collega a classi/razze
- Implementa prerequisites

### 8. AGENT_UI 🎨
**Repository**: `scripts/agent-ui.py`
**Compito**: Visualizzazione e UX
- Test caricamento in Foundry
- Fix display issues
- Verifica sheet functionality
- Screenshot errori

## 📋 EXECUTION PIPELINE

```bash
# FASE 1: ANALISI
python3 scripts/agent-monitor-dnd5e.py
python3 scripts/agent-validator.py > validation-baseline.md

# FASE 2: FIX DATABASE
python3 scripts/agent-database.py
python3 scripts/agent-features.py

# FASE 3: FIX CLASSI
python3 scripts/agent-classes.py
python3 scripts/agent-spells.py

# FASE 4: FIX ROLLTABLES
python3 scripts/agent-rolltables.py

# FASE 5: VALIDAZIONE
python3 scripts/agent-validator.py > validation-final.md
python3 scripts/agent-ui.py

# FASE 6: COMPILAZIONE
fvtt package workon brancalonia --type Module
fvtt package pack all
```

## 🔍 STRUMENTI ESTERNI

1. **Foundry Factory**: https://foundryfactory.com
2. **D&D 5e SRD**: https://github.com/foundryvtt/dnd5e
3. **UUID Generator**: Built-in Foundry tools
4. **JSON Validator**: jsonlint.com
5. **Foundry CLI**: @foundryvtt/foundryvtt-cli

## 📊 METRICHE DI SUCCESSO

NON percentuali false ma:
- Numero classi con advancement completi: X/12
- Numero features collegate: X/500+
- Numero spell implementate: X/300+
- Numero RollTables popolate: X/81
- Test passati: X/1000+

## 🚀 AVVIO IMMEDIATO

```bash
# Creare tutti gli agent
touch scripts/agent-{monitor-dnd5e,validator,database,classes,spells,rolltables,features,ui}.py
chmod +x scripts/*.py
```

## ⚠️ NO COMPROMESSI

- Se manca un feature → CREARLO
- Se UUID è rotto → FIXARLO
- Se spell non c'è → AGGIUNGERLA
- Se RollTable vuota → POPOLARLA

**MAI RIMUOVERE, SEMPRE IMPLEMENTARE**