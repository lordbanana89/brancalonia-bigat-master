# Brancalonia - Il Regno di Taglia per Foundry VTT

## Versione 3.0.0 - Implementazione Completa

Modulo completo per giocare a **Brancalonia** su Foundry VTT v13 con il sistema D&D 5e.

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

#### 📊 Contenuti
- 10 Stirpi/Razze complete
- 2 Classi complete (Knave, Straccione) + template per altre
- 25+ Equipaggiamenti scadenti
- 8+ Talenti specifici
- Tabelle casuali del manuale
- PNG e mostri di Brancalonia

### 📦 Installazione

#### Requisiti
- Foundry VTT v13.0.0 o superiore (testato fino a v13.347)
- Sistema D&D 5e v3.3.0 o superiore (testato con v3.3.1)

#### Metodo 1: URL Manifest
1. In Foundry VTT, vai su **Configurazione** → **Moduli**
2. Clicca **Installa Modulo**
3. Incolla questo URL nel campo Manifest:
```
https://raw.githubusercontent.com/brancalonia-community/brancalonia-bigat/main/module.json
```
4. Clicca **Installa**

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

### 🐛 Segnalazione Bug

Se trovi problemi, segnalali su:
- GitHub Issues: [Link al repository]
- Discord Brancalonia: #foundry-vtt

### 📜 Licenza

Questo modulo è rilasciato sotto licenza MIT.
I contenuti di Brancalonia sono proprietà di Acheron Games.

### 👥 Credits

- **Sviluppo**: Brancalonia Community
- **Testing**: Community Discord Brancalonia
- **Contenuti**: Basati sui manuali ufficiali Brancalonia

---

**Versione**: 3.0.0
**Compatibilità**: Foundry VTT v13.0.0+ | D&D 5e v3.3.0+
**Ultimo Aggiornamento**: 2025-01-24