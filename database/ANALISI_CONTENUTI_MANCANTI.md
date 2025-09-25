# Analisi Contenuti Database Brancalonia

## Struttura Attuale Database

### ✅ CONTENUTI GIÀ PRESENTI

#### 1. **Classi** (`/database/classi/`)
- Classi complete con privilegi e progressione
- Sottoclassi di Brancalonia
- 136+ file di privilegi per varie classi

#### 2. **Razze** (`/database/razze/`)
- 16 razze di Brancalonia
- Include: Giffi, Malebranche, Marionette, Morganti, ecc.

#### 3. **Background** (`/database/backgrounds/`)
- 7 background base
- Background aggiuntivi in `/database/macaronicon/backgrounds/` (10 file)

#### 4. **Incantesimi** (`/database/incantesimi/`)
- Incantesimi specifici di Brancalonia:
  - Assicurazione (3°)
  - Esorcismo (2°)
  - Banchetto dei Poveri (3°)
  - Emanazione Angelica (3°)
  - Mondare (3°)
  - Bollo di Qualità (1°)
  - Marchio Incandescente (1°)
  - Racconto Agghiacciante (1°)
- Incantesimi D&D standard creati (da rimuovere, useremo modulo ufficiale)

#### 5. **Talenti** (`/database/talenti/`)
- 8 talenti specifici di Brancalonia:
  - Anima Contadina
  - Antica Arte Culinaria
  - Compagno della Selva
  - Sangue della Vilupera
  - Scaglianza
  - Scudanza
  - Speziale
  - Supercazzola

#### 6. **Equipaggiamento** (`/database/equipaggiamento/`)
- **Cimeli**: 50 cimeli completi in `/equipaggiamento/cimeli/`
- Armi e armature base
- Equipaggiamento vario

#### 7. **Regole** (`/database/regole/`)
- Sistema Rissa
- Sistema Malefatte e Taglia
- Nomea e Sbraco
- Condizioni speciali
- Esplorazione

#### 8. **Emeriticenze** (`/database/emeriticenze/`)
- Sistema per avanzamento oltre il 6° livello

#### 9. **Creature Macaronicon** (`/database/macaronicon/png_mostri/`)
- PNG minori e maggiori
- Mostri minori e maggiori
- Creature uniche
- PNG leggendari

---

## 🔴 CONTENUTI MANCANTI DA INTEGRARE

### 1. **Creature del Manuale Base** 
Directory `/database/creature/` ha solo il Bavalischio. Mancano:
- **Anguana** (p.164)
- **Befana** (p.166-169)
- **Bigatto** (p.170-171)
- **Confinato** (p.172-174)
- **Sciame di Corvoragni** (p.175)
- **Foionco** (p.175)
- **Malacoda** (p.176-177)
- **Marroca** (p.178)
- **Orco Cattivo** (p.179)
- **Serpegatto** (p.180)
- **Vilupera** (p.180-181)

### 2. **PNG e Avversari Ricorrenti**
Dal manuale base (p.182+):
- Agente di Equitaglia
- Animali Parlanti
- Bagatto
- Birro
- Capobirro
- Cacciatore di Equitaglia
- Comandante
- Dragone
- Duellante
- Altri PNG tipici

### 3. **Oggetti Magici Specifici**
Dal manuale base (p.67-70) - verificare se non sono già nei cimeli:
- Bacchetta del due su tre
- Briglie di San Sirio il Draconiano
- Giranello magico
- Il pelo perduto del lupo
- La Zappa di Scippo
- La Spada di Scippo
- Altri oggetti magici narrativi

### 4. **Intrugli** (p.65-66)
- Sistema degli intrugli
- Lista intrugli specifici

### 5. **Contenuti Narrativi**
- Generatore di Bettole (p.81-83)
- Generatore di Profezie (p.86)
- Strade che non vanno da nessuna parte (p.84-85)

---

## 📋 AZIONI DA COMPLETARE

1. **Rimuovere incantesimi D&D standard** che ho creato (useremo modulo ufficiale)
2. **Aggiungere creature manuale base** in `/database/creature/`
3. **Aggiungere PNG ricorrenti** in directory appropriata
4. **Verificare oggetti magici** non duplicati con cimeli
5. **Aggiungere sistema intrugli**
6. **Aggiungere generatori narrativi** (bettole, profezie, strade)

---

## Note
- Il database ha già 795 file JSON
- Struttura modulare ben organizzata
- Macaronicon ha contenuti separati in `/database/macaronicon/`
- Cimeli sono in `/equipaggiamento/cimeli/` NON creare directory separata
- Incantesimi D&D base verranno dal modulo ufficiale dnd5e v5.1.9
