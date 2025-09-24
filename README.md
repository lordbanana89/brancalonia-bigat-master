# Brancalonia - Il Regno di Taglia per Foundry VTT

![Foundry v13](https://img.shields.io/badge/Foundry-v13-informational)
![D&D 5e](https://img.shields.io/badge/dnd5e-v5.1.9-orange)
[![GitHub Latest Release](https://img.shields.io/github/release/lordbanana89/brancalonia-bigat-master?style=flat-square)](https://github.com/lordbanana89/brancalonia-bigat-master/releases/latest)

## Versione 3.4.0 - Condizioni Custom e Bug Fix

Modulo completo per giocare a **Brancalonia** su Foundry VTT v13 con il sistema D&D 5e v5.x.

### 🎯 Caratteristiche

#### ✅ Sistemi Core Implementati (100%)
- **Sistema Infamia**: Tracciamento 0-100 con 6 livelli e conseguenze
- **Gestione Compagnia**: Sistema completo per il gruppo di PG
- **Haven/Rifugio**: 14 tipi di stanze con eventi casuali
- **Risse da Taverna**: Combattimento non letale con ubriachezza
- **Lavori Sporchi**: 8 tipi con complicazioni dinamiche
- **Menagramo**: Maledizione con 4 livelli ed effetti
- **Oggetti Scadenti**: Sistema rottura e riparazione
- **Meccaniche Extra**: Trappole, patroni, tabelle casuali

#### ✅ Nuovi Sistemi Avanzati
- **Malattie**: 8 malattie con stadi, contagio e cure
- **Hazard Ambientali**: 20+ pericoli (naturali, urbani, dungeon, magici)
- **Duelli Formali**: 6 tipi di duello, 5 stili di combattimento
- **Sistema Fazioni**: 7 fazioni con reputazione, guerre e quest
- **Reputazione Positiva**: 5 tipi con benefici progressivi
- **Sistema Equitaglia**: Gestione taglie e malefatte con bounty hunter
- **Rischi del Mestiere**: 23 eventi casuali per lavori sporchi

#### 🆕 Condizioni Custom (v3.4.0)
- **Menagramo**: Maledizione con svantaggi e -2 CA
- **Ubriaco**: Modifiche alle caratteristiche (+2 Car, -2 Des/Sag)
- **Batosta**: Sistema contatore per risse (KO a 3 batoste)
- **Incapacitato**: Impedisce azioni, reazioni e movimento

#### 📊 Contenuti (234 elementi totali)
- **12 Stirpi/Razze** complete
- **6 Background** di Brancalonia
- **75 Privilegi** (features)
- **12 Sottoclassi** specifiche
- **23 Talenti** di Brancalonia
- **12 Emeriticenze** (tratti)
- **23 Equipaggiamenti** scadenti
- **12 Incantesimi** specifici
- **8 PNG** di Brancalonia
- **15 Regole** (journal entries)
- **31 Tabelle Casuali**
- **5 Macro** automatiche

### 📦 Installazione

#### Requisiti
- Foundry VTT v13.0.0 o superiore (testato fino a v13.347)
- Sistema D&D 5e v5.0.0 o superiore (ottimizzato per v5.1.9)

#### ⚠️ Nota Importante per gli Sviluppatori
I compendi di Foundry v13 richiedono il campo `_key` in formato `!collection!id` per ogni documento JSON. Senza questo campo, il CLI di Foundry creerà database vuoti. Vedi la sezione Sviluppo per dettagli.

#### Metodo 1: URL Manifest (Raccomandato)
1. In Foundry VTT, vai su **Add-on Modules** → **Install Module**
2. Incolla questo URL nel campo Manifest:
```
https://raw.githubusercontent.com/lordbanana89/brancalonia-bigat-master/main/module.json
```
3. Clicca **Install**
4. Attiva il modulo nel tuo mondo

#### Metodo 2: Installazione Manuale
1. Scarica l'ultima release da GitHub
2. Estrai il contenuto nella cartella:
   - Windows: `%appdata%/Local/FoundryVTT/Data/modules/`
   - macOS: `~/Library/Application Support/FoundryVTT/Data/modules/`
   - Linux: `~/.local/share/FoundryVTT/Data/modules/`
3. Riavvia Foundry VTT
4. Attiva il modulo nel tuo mondo

### 🚀 Uso Rapido

#### Attivazione nel Mondo
1. Apri il tuo mondo D&D 5e
2. Vai su **Configurazione** → **Gestisci Moduli**
3. Trova "Brancalonia - Il Regno di Taglia" e attivalo
4. Clicca **Salva e Ricarica**

#### Primi Passi
1. **Crea un personaggio**: Usa le stirpi di Brancalonia dal compendio
2. **Assegna una classe**: Scegli Knave o Straccione dal compendio
3. **Inizia l'Infamia**: Il tracker appare automaticamente sulla scheda
4. **Crea la Compagnia**: Usa il comando `/compagnia` in chat
5. **Gestisci il Haven**: Accedi tramite il menu del GM

### 💻 Comandi Console per GM

```javascript
// Sistema Infamia
game.brancalonia.infamiaTracker.addInfamia(actor, 10)

// Risse da Taverna
game.brancalonia.tavernBrawl.startBrawl()

// Lavori Sporchi
game.brancalonia.dirtyJobs.generateJob("furto", 3)

// Menagramo
game.brancalonia.menagramo.applyMenagramo(actor, 2)

// Malattie
game.brancalonia.diseases.infectActor(actor, "peste_nera")

// Hazard
game.brancalonia.hazards.triggerHazard("frana", actor)

// Duelli
game.brancalonia.dueling.startDuel(actor1, actor2, "primo_sangue")

// Fazioni
game.brancalonia.factions.adjustReputation(actor, "chiesa_calendaria", 10)

// Reputazione
game.brancalonia.reputation.adjustReputation(actor, "onore", 20)
```

### 🛠️ Configurazione

Accedi alle impostazioni del modulo da **Configurazione** → **Impostazioni Modulo**:

- **Tracciamento Infamia**: Attiva/disattiva il sistema infamia
- **Risse Non Letali**: Abilita danno non letale nelle risse
- **Oggetti Scadenti**: Attiva sistema rottura equipaggiamento
- **Sistema Compagnia**: Abilita gestione gruppo
- **Lavori Automatici**: Genera lavori sporchi automaticamente
- **Sistema Haven**: Attiva gestione del rifugio

### 📝 Compatibilità

- ✅ **100% Compatibile** con D&D 5e System API
- ✅ **Nessun override** di classi core
- ✅ **Solo hook ufficiali** utilizzati
- ✅ **Active Effects** standard V13
- ✅ **Advancement API** per progressione personaggi

### 📋 Changelog v3.4.0

#### Nuove Funzionalità
- Implementate 4 condizioni custom con icone SVG dedicate
- Sistema completo Equitaglia per taglie e malefatte
- Sistema Rischi del Mestiere con 23 eventi casuali
- Active Effects automatici per tutte le condizioni

#### Bug Fix
- Corretto errore "Invalid status ID" per condizioni custom
- Risolto problema deprecazione `icon` → `img` per ActiveEffect
- Sistemato async/await per Roll.evaluate() in v13
- Corretti flag scope da "brancalonia" a "brancalonia-bigat"
- Eliminati tutti i warning di deprecazione

### 🐛 Segnalazione Bug

Se trovi problemi, segnalali su:
- GitHub Issues: [https://github.com/lordbanana89/brancalonia-bigat-master/issues](https://github.com/lordbanana89/brancalonia-bigat-master/issues)
- Discord Brancalonia: #foundry-vtt

### 📜 Licenza

Questo modulo è rilasciato sotto licenza MIT.
I contenuti di Brancalonia sono proprietà di Acheron Games.

### 👥 Credits

- **Sviluppo**: Brancalonia Community
- **Testing**: Community Discord Brancalonia
- **Contenuti**: Basati sui manuali ufficiali Brancalonia

---

## 🔧 Sviluppo

### ⚠️ SCOPERTA CRITICA: Compilazione Compendi per Foundry v13

#### Il Problema dei Compendi Vuoti
Durante lo sviluppo abbiamo scoperto che **Foundry VTT v13 NON carica i compendi** se non rispettano requisiti specifici non documentati:

1. **Campo `_key` obbligatorio**: Ogni documento DEVE avere un campo `_key` in formato `!collection!id`
2. **Il CLI v3.0.0 rimuove `_key`**: Il Foundry CLI v3.0.0 elimina silenziosamente il campo `_key` durante la compilazione
3. **Struttura directory specifica**: Il database deve essere direttamente in `packs/nome-pack/`, NON in `packs/nome-pack/nome-pack/`

#### Soluzione Funzionante

##### 1. Preparazione Documenti JSON
Ogni documento in `_source/` deve avere questa struttura:
```json
{
  "_id": "documento_id",
  "_key": "!items!documento_id",  // CRITICO: Senza questo, il compendio sarà vuoto!
  "name": "Nome Documento",
  "type": "feat",
  // ... altri campi
}
```

Collezioni valide per `_key`:
- `!items!` - per Item (oggetti, talenti, features, backgrounds, sottoclassi)
- `!actors!` - per Actor (PNG, creature)
- `!journal!` - per JournalEntry (regole, documentazione)
- `!tables!` - per RollTable (tabelle casuali)
- `!macros!` - per Macro

##### 2. Script di Compilazione Customizzato
**NON usare** `fvtt package pack` perché rimuove il campo `_key`!

Usa invece il nostro script `compile-with-keys.cjs`:
```javascript
// compile-with-keys.cjs
const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

async function compilePack(packName, collectionType) {
  const sourcePath = path.join(__dirname, 'packs', packName, '_source');
  const dbPath = path.join(__dirname, 'packs', packName); // IMPORTANTE: Non in sottocartella!

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));
    const key = `!${collectionType}!${content._id}`;

    // CRITICO: Preservare _key nel documento salvato
    const docToSave = { ...content, _key: key };
    await db.put(key, docToSave);
  }

  await db.close();
}
```

##### 3. Processo di Build Completo
```bash
# 1. Aggiungi _key a tutti i documenti esistenti
node add-keys.cjs

# 2. Compila con _key preservato (NON usare fvtt CLI!)
node compile-with-keys.cjs

# 3. Verifica che i documenti abbiano _key
node verify-packs.cjs
```

#### Struttura Directory Corretta
```
packs/
├── nome-pack/
│   ├── _source/         # File JSON sorgente con _key
│   ├── 000005.ldb       # Database LevelDB compilato
│   ├── CURRENT          # DIRETTAMENTE qui, non in sottocartella!
│   ├── LOG
│   └── MANIFEST-*
```

⚠️ **SBAGLIATO** (non funziona in Foundry v13):
```
packs/nome-pack/nome-pack/  # ❌ Database in sottocartella = compendi vuoti!
```

#### Verifica Database
Per verificare che un database sia compilato correttamente:
```javascript
const { ClassicLevel } = require('classic-level');
const db = new ClassicLevel('./packs/nome-pack', { valueEncoding: 'json' });
await db.open();

for await (const [key, value] of db.iterator()) {
  console.log('Key:', key);           // Deve essere !collection!id
  console.log('_key:', value._key);   // DEVE esistere e corrispondere a key
  console.log('_id:', value._id);     // Deve esistere
  break;
}
await db.close();
```

#### Problemi Noti e Soluzioni

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| Compendi vuoti in Foundry | Manca campo `_key` | Usa `compile-with-keys.cjs`, non il CLI |
| "Cannot read database" | Database in sottocartella | Sposta file DB direttamente in `packs/nome/` |
| CLI non segnala errori | CLI v3.0.0 salta silenziosamente documenti senza `_key` | Verifica sempre con `verify-packs.cjs` |

### Script di Utility

#### add-keys.cjs
Aggiunge il campo `_key` a tutti i documenti JSON in `_source/`

#### compile-with-keys.cjs
Compila i pack preservando il campo `_key` (alternativa al CLI)

#### fix-pack-structure.cjs
Corregge la struttura delle directory spostando i DB nella posizione corretta

#### verify-packs.cjs
Verifica che tutti i documenti nei database abbiano il campo `_key`

---

**Versione**: 3.4.0
**Compatibilità**: Foundry VTT v13.0.0+ | D&D 5e v5.0.0+
**Ultimo Aggiornamento**: Settembre 2025