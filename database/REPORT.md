# Database Meccaniche Brancalonia - Report di Validazione

## 📊 Stato Attuale

### Database Documentato
- **Razze**: 6 completamente documentate dal manuale base
  - ✅ Dotato (dotato_brancalonia)
  - ✅ Malebranche (malebranche001)
  - ✅ Marionetta (marionetta001)
  - ✅ Morgante (morgante001)
  - ✅ Selvatico (selvatico_brancalonia)
  - ⚠️ Umano - Non implementato (solo privilegio rissa necessita effect)

### Copertura Attuale Active Effects nel Modulo
- Razze: 11/11 (100%)
- Talenti: 23/23 (100%)
- Features: 27/78 (34.6%)
- Backgrounds: 6/6 (100%)
- Emeriticenze: 9/12 (75%)
- Equipaggiamento: 12/27 (44.4%)

## 🎯 Metodologia

### Classificazione Meccaniche
Ogni meccanica è classificata come:

1. **Attiva**: Richiede Active Effect
   - Bonus numerici a caratteristiche
   - Modifiche a movimento, CA, PF
   - Resistenze/Immunità
   - Competenze
   - Vantaggi/Svantaggi condizionali

2. **Advancement**: Gestita da D&D 5e Advancement API
   - Talenti
   - Abilità extra
   - Incantesimi conosciuti
   - ASI (Ability Score Improvements)

3. **Narrativa**: Non richiede implementazione meccanica
   - Età, aspettative di vita
   - Background narrativi
   - Descrizioni fisiche

4. **Passiva**: Impostata una volta alla creazione
   - Taglia
   - Tipo creatura

## 📝 Meccaniche Documentate per Razza

### Umano
- **Attive**: Velocità, Privilegio Rissa (+1 slot mosse)
- **Advancement**: Talento, Abilità a scelta
- **Problema**: Non implementato nel modulo

### Dotato
- **Attive**: Velocità, Risonanza Magica (recupero slot)
- **Advancement**: Influsso Magico (trucchetto + incantesimo)
- **Implementato**: ✅ dotato_brancalonia

### Morgante
- **Attive**:
  - Gigantesco (capacità trasporto x2)
  - Robusto (+1 PF/livello)
  - Stomaco d'Acciaio (vantaggio TS)
  - Privilegio Rissa
- **Implementato**: ✅ morgante001

### Selvatico
- **Attive**:
  - Cresciuto nella Selva (nascondersi con copertura naturale)
  - Istinto Primordiale (competenze Percezione e Sopravvivenza)
  - Privilegio Rissa Tosto (ignora batoste)
- **Implementato**: ✅ selvatico_brancalonia

### Marionetta
- **Attive**:
  - Costrutto (immunità veleno, malattie)
  - Vulnerabilità fuoco
  - Aggiustarsi (+2d8 Dadi Vita riposo breve)
  - Braccio Smontabile
- **Sottorazze**:
  - Pinocchio: Credulone (svantaggio Intuizione)
  - Pupo: Armatura Innestata (CA speciale)
- **Implementato**: ✅ marionetta001

### Malebranche
- **Attive**:
  - Scurovisione 36m
  - Privilegio Rissa Malebotte (vantaggio TS)
  - 2 Malitratti a scelta tra:
    - Maleali (no danni caduta)
    - Malefiamme (soffio 2d6)
    - Malegambe (velocità 12m)
    - Malavoce (charme 1/riposo)
    - Malemani (artigli + scalare)
    - Malerecchie (expertise Percezione udito)
- **Implementato**: ✅ malebranche001

## ⚠️ Discrepanze Identificate

1. **Umano**: Non ha Active Effects nel modulo
   - Manca: Privilegio Rissa Versatilità (+1 slot mosse)

2. **ID non consistenti**:
   - Database usa suffisso 001
   - Modulo usa mix di _brancalonia e 001

3. **Features mancanti documentazione**:
   - Solo 27/78 implementate (34.6%)
   - Molte potrebbero essere narrative o advancement

## 📋 Prossimi Passi

1. **Urgente**:
   - [ ] Implementare Active Effects per Umano
   - [ ] Standardizzare naming convention degli ID

2. **Importante**:
   - [ ] Documentare classi dal manuale base
   - [ ] Documentare talenti ed emeriticenze
   - [ ] Verificare quali features sono realmente attive vs narrative

3. **Nice to have**:
   - [ ] Estrarre meccaniche dal Macaronicon
   - [ ] Creare test automatici per validazione

## 🔧 Note Tecniche

### Mode Active Effects
- **1 (MULTIPLY)**: Moltiplica il valore
- **2 (ADD)**: Aggiunge al valore
- **5 (OVERRIDE)**: Sovrascrive il valore

### Path Sistema D&D 5e
- Caratteristiche: `system.abilities.[str|dex|con|int|wis|cha].value`
- Movimento: `system.attributes.movement.[walk|climb|fly|swim]`
- Competenze: `system.skills.[SKILL].value`
- Resistenze: `system.traits.[dr|di|dv|ci].value`

## 📈 Conclusioni

Il modulo ha un'ottima copertura per le meccaniche core (razze, talenti, backgrounds) ma manca documentazione sistematica per capire quali features necessitano realmente Active Effects vs quali sono gestite da Advancement o sono puramente narrative.

La struttura del database creata permette ora di:
1. Validare sistematicamente ogni meccanica
2. Identificare cosa manca
3. Pianificare implementazioni future
4. Mantenere consistenza tra documentazione e codice