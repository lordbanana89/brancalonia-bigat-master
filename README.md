# Brancalonia - Il Regno di Taglia per Foundry VTT

![Foundry v13](https://img.shields.io/badge/Foundry-v13-informational)
![D&D 5e](https://img.shields.io/badge/dnd5e-v5.1.9-orange)
[![GitHub Latest Release](https://img.shields.io/github/release/lordbanana89/brancalonia-bigat-master?style=flat-square)](https://github.com/lordbanana89/brancalonia-bigat-master/releases/latest)

## 🏰 Modulo Enterprise-Grade per Brancalonia

Modulo **enterprise-grade** completo per giocare a **Brancalonia - Il Regno di Taglia** su Foundry VTT, con tutte le meccaniche ufficiali implementate e un sistema di logging, monitoring e statistics tracking avanzato.

### ✨ Sistemi Implementati
- **Sistema Infamia e Reputazione** - Traccia la fama/infamia dei personaggi (0-100 livelli)
- **Haven System** - Gestione completa dei rifugi con 14 tipi di stanze ed eventi casuali
- **Gestione Compagnia** - Organizza e gestisci la tua banda di tagliagole
- **Lavori Sporchi** - Sistema di missioni con 8 tipi e complicazioni dinamiche
- **Menagramo** - Il destino avverso con 4 livelli ed effetti progressivi
- **Duelli Formali** - Combattimenti uno contro uno con 6 tipi e 5 stili
- **Oggetti Scadenti** - Equipaggiamento che si rompe e può essere riparato
- **Malattie** - 8 malattie con stadi, contagio e cure specifiche
- **Hazard Ambientali** - 20+ pericoli (naturali, urbani, dungeon, magici)
- **Sistema Fazioni** - 7 fazioni con reputazione, guerre e quest
- **Reputazione Positiva** - 5 tipi con benefici progressivi
- **Sistema Equitaglia** - Gestione taglie e malefatte con bounty hunter
- **Rischi del Mestiere** - 23 eventi casuali per lavori sporchi

### 🎨 Sistema Theme Rinascimentale
- **Tema pergamena rinascimentale** con decorazioni dorate
- **32+ colori configurabili** tramite interfaccia grafica
- **4 preset temi** disponibili (Taverna, Palazzo, Cantina, Pergamena)
- **Export/Import temi** per condividere configurazioni

### 🚀 Architettura Enterprise-Grade (v13.0.0)

#### Sistema di Logging Centralizzato
- **5 livelli di log** configurabili (ERROR, WARN, INFO, DEBUG, TRACE)
- **Output colorato** nella console con mapping sui metodi console nativi
- **Storia log persistente** con rotation automatica
- **51 moduli integrati** con il logger centralizzato
- **Performance tracking** con auto-cleanup
- **Event emitter** per log streams

#### Statistics & Monitoring
- **27 moduli** con statistics tracking completo
- **Metriche runtime dettagliate** per ogni sistema
- **Success/failure rates** automatici
- **Error tracking** con timestamp e stack traces
- **Performance monitoring** su tutte le operazioni critiche
- **99+ event emissions** per comunicazione inter-modulo

#### Public APIs
- **`getStatus()`** - Stato corrente di ogni modulo
- **`getStatistics()`** - Statistiche runtime dettagliate
- **`resetStatistics()`** - Reset delle metriche
- **`showReport()`** - Report visuale completo con export JSON

#### Developer Experience
- **JSDoc completo** su tutti i metodi pubblici
- **Error handling robusto** con try-catch su tutte le operazioni
- **State management** consistente attraverso `_state` objects
- **Event-driven architecture** per integrazione modulare
- **Zero linter errors** su 86 file JavaScript

### 📊 Contenuti del Modulo
- **13 Compendi Completi** con **1.137 documenti** totali
- **Stirpi/Razze**: 9 razze uniche di Brancalonia
- **Background**: 22 background caratteristici italiani
- **Classi**: 13 classi D&D 5e adattate + specializzazioni
- **Sottoclassi**: 21 sottoclassi per tutte le classi D&D 5e
- **Talenti**: 8 talenti specifici di Brancalonia
- **Privilegi**: 491 privilegi e caratteristiche di classe
- **Equipaggiamento**: 258 oggetti scadenti e armi primitive
- **Incantesimi**: 94 incantesimi del Regno di Taglia
- **PNG**: 44 personaggi non giocanti caratteristici
- **Macro**: 22 macro automatiche per il gameplay
- **Regole**: 62 documenti con regole complete
- **Tabelle Casuali**: 82 tabelle per generazione contenuti

**🎯 Database compilati e pronti per Foundry VTT v13**

### 🎭 Condizioni Custom
- **Menagramo**: Maledizione con -2 CA e svantaggi
- **Ubriaco**: +2 Carisma, -2 Destrezza/Saggezza
- **Batosta**: Sistema contatore per risse (KO a 3 batoste)
- **Incapacitato**: Impossibile agire, reagire o muoversi

### 🚀 Installazione

#### Requisiti
- **Foundry VTT** v13.0.0 o superiore
- **Sistema D&D 5e** v5.0.0 o superiore

#### Installazione Automatica (Raccomandata)
1. In Foundry VTT, vai su **Add-on Modules** → **Install Module**
2. Incolla questo URL nel campo Manifest:
   ```
   https://raw.githubusercontent.com/lordbanana89/brancalonia-bigat-master/main/module.json
   ```
3. Clicca **Install**
4. Attiva il modulo nel tuo mondo

#### Installazione Manuale
1. Scarica l'ultima release da GitHub
2. Estrai nella cartella modules di Foundry VTT
3. Riavvia Foundry VTT
4. Attiva il modulo nel tuo mondo

### 🎮 Uso Rapido

#### Primi Passi
1. **Crea un personaggio**: Usa le stirpi di Brancalonia dal compendio Razze
2. **Assegna una classe**: Scegli Knave o Straccione dal compendio Classi
3. **Inizia l'Infamia**: Il tracker appare automaticamente sulla scheda personaggio
4. **Crea la Compagnia**: Usa il comando `/compagnia` in chat
5. **Gestisci il Haven**: Accedi tramite il menu del GM

#### Comandi Chat Disponibili
- `/infamia [add|remove|set] [valore]` - Gestione infamia
- `/haven` - Gestione rifugio
- `/compagnia` - Gestione compagnia
- `/menagramo` - Tira il menagramo
- `/lavori` - Genera lavori sporchi
- `/duello` - Inizia un duello
- `/fazione` - Gestione reputazione fazioni
- `/malattia` - Sistema malattie
- `/hazard` - Eventi ambientali
- `/rissa` - Inizia una rissa da taverna
- `/equitaglia` - Sistema taglie e malefatte

#### Configurazione
Accedi alle impostazioni del modulo da **Configurazione** → **Impostazioni Modulo**:

- **Tracciamento Infamia**: Attiva/disattiva il sistema infamia
- **Risse Non Letali**: Abilita danno non letale nelle risse
- **Oggetti Scadenti**: Attiva sistema rottura equipaggiamento
- **Sistema Compagnia**: Abilita gestione gruppo
- **Lavori Automatici**: Genera lavori sporchi automaticamente
- **Sistema Haven**: Attiva gestione del rifugio

## 📝 Compatibilità

- ✅ **100% Compatibile** con D&D 5e System API
- ✅ **Nessun override** di classi core
- ✅ **Solo hook ufficiali** utilizzati
- ✅ **Active Effects** standard v13
- ✅ **Advancement API** per progressione personaggi

## 📜 Licenza

Questo modulo è rilasciato sotto licenza MIT.
I contenuti di Brancalonia sono proprietà di Acheron Games.

## 🙏 Crediti

- **Sviluppo**: Brancalonia Community
- **Testing**: Community Discord Brancalonia
- **Contenuti**: Basati sui manuali ufficiali Brancalonia

## 🐛 Segnalazione Bug

Se trovi problemi, segnalali su:
- GitHub Issues: [https://github.com/lordbanana89/brancalonia-bigat-master/issues](https://github.com/lordbanana89/brancalonia-bigat-master/issues)
- Discord Brancalonia: #foundry-vtt

---

**Versione**: 13.0.0 🚀
**Compatibilità**: Foundry VTT v13.0.0+ | D&D 5e v5.0.0+
**Ultimo Aggiornamento**: Gennaio 2025 (Refactoring Enterprise-Grade)

### 🎯 Novità v13.0.0
- ✅ Sistema di logging centralizzato su 51 moduli
- ✅ Statistics tracking completo su 27 moduli
- ✅ Performance monitoring su tutte le operazioni critiche
- ✅ Public APIs per debugging e monitoring
- ✅ Event-driven architecture per comunicazione inter-modulo
- ✅ Error handling robusto con zero linter errors
- ✅ JSDoc completo su tutti i metodi pubblici
- ✅ Refactoring completo di `tavern-brawl`, `tavern-entertainment`, `wilderness-encounters`, `shoddy-equipment`, `menagramo-system`

---

## 🎭 Buon gioco nel Regno di Taglia!
