# 🚀 Guida Rapida - Brancalonia per Foundry VTT

Questa guida ti aiuta a iniziare rapidamente con il modulo Brancalonia.

## 📦 Installazione

### 1. Installazione Automatica (Raccomandata)
1. In Foundry VTT, vai su **Add-on Modules** → **Install Module**
2. Incolla questo URL nel campo Manifest:
   ```
   https://raw.githubusercontent.com/lordbanana89/brancalonia-bigat-master/main/module.json
   ```
3. Clicca **Install**
4. Attiva il modulo nel tuo mondo

### 2. Requisiti di Sistema
- **Foundry VTT** v13.0.0 o superiore
- **Sistema D&D 5e** v5.0.0 o superiore
- **Spazio su disco**: ~50MB per il modulo completo

## 🎮 Primi Passi

### 1. Crea un Personaggio
1. Vai su **Compendi** → **Brancalonia** → **Razze**
2. Trascina una razza nella tua scheda personaggio
3. Scegli un background dal compendio **Background**
4. Seleziona una classe dal compendio **Classi**

### 2. Sistemi Automatici
Una volta creato il personaggio:

- **🎭 Infamia**: Appare automaticamente sulla scheda (0-100 livelli)
- **🏠 Compagnia**: Crea un gruppo con `/compagnia` in chat
- **🏰 Haven**: Gestisci il rifugio con `/haven` in chat
- **⚔️ Equipaggiamento**: Usa gli oggetti scadenti dal compendio

### 3. Configurazione Base
Vai su **Configurazione** → **Impostazioni Modulo** → **Brancalonia**:

- ✅ **Tracciamento Infamia**: Attiva il sistema di reputazione
- ✅ **Sistema Compagnia**: Abilita gestione del gruppo
- ✅ **Sistema Haven**: Attiva i rifugi
- ✅ **Lavori Automatici**: Genera missioni automaticamente

## 💬 Comandi Chat Disponibili

### Sistema Infamia
```
/infamia add 5          # Aggiunge 5 punti di infamia
/infamia remove 3       # Rimuove 3 punti di infamia
/infamia set 25         # Imposta infamia a 25
/infamia check          # Mostra infamia attuale
```

### Sistema Compagnia
```
/compagnia create       # Crea una nuova compagnia
/compagnia join         # Unisciti a una compagnia esistente
/compagnia leave        # Abbandona la compagnia
/compagnia status       # Mostra stato della compagnia
```

### Sistema Haven (Rifugi)
```
/haven create "Il Covo" tavern    # Crea un rifugio di tipo taverna
/haven upgrade dormitorio         # Migliora una stanza
/haven status                     # Mostra stato del rifugio
/haven events                     # Eventi casuali del rifugio
```

### Altri Comandi
```
/lavori generate furto        # Genera un lavoro sporco
/duello start @player1 @player2 primo_sangue
/malattia infect febbre_palustre
/hazard trigger frana
/rissa start                 # Inizia una rissa da taverna
/fazione reputation chiesa_calendaria 10
```

## 🎨 Tema Rinascimentale

### Preset Disponibili
1. **Taverna Malandata** - Atmosfera da osteria
2. **Palazzo Rinascimentale** - Eleganza nobiliare
3. **Cantina del Vino** - Toni caldi e vinosi
4. **Pergamena Antica** - Stile manoscritto

### Personalizzazione
- **32+ colori configurabili** tramite interfaccia
- **Decorazioni angolari dorate** per atmosfera rinascimentale
- **Animazioni speciali** per infamia, baraonda, menagramo

## ⚔️ Meccaniche di Gioco

### Sistema Infamia (0-100 livelli)
- **0-10**: Sconosciuto
- **10-25**: Poco noto (sconti criminali)
- **25-50**: Mal visto (guardie sospettose)
- **50-75**: Ricercato (taglie minori)
- **75-100**: Fuorilegge (bandito dalle città)
- **100+**: Nemico pubblico (kill on sight)

### Sistema Compagnia
- Gestisci fino a **6 membri**
- **Reputazione condivisa**
- **Risorse comuni**
- **Compagnia** influenza l'infamia individuale

### Sistema Haven
14 tipi di stanze disponibili:
- **Dormitorio**: +1 dado vita per riposo
- **Cucina**: +2 HP, rimuove sfinimento
- **Armeria**: 50% sconto riparazioni
- **Laboratorio**: Pozioni e veleni
- **Biblioteca**: Bonus conoscenze
- **Cappella**: Cure divine
- **Stalla**: Cavalli e trasporti
- **Magazzino**: Deposito sicuro
- **Officina**: Costruzioni e riparazioni
- **Cucce**: Animali da guardia
- **Prigione**: Celle per prigionieri
- **Torre**: Vedetta e difesa
- **Segrete**: Torture e interrogatori
- **Sala del trono**: Status sociale

## 🎲 Eventi Casuali

Il modulo include **360+ tabelle** per generazione contenuti:
- **Incontri stradali** (50+ eventi)
- **Eventi del rifugio** (20+ possibilità)
- **Complicazioni lavori sporchi** (30+ eventi)
- **Hazard ambientali** (20+ pericoli)
- **Malattie** (8 malattie complete)
- **Sogni e presagi** (15+ visioni)

## 🛠️ Risoluzione Problemi

### Problemi Comuni
1. **Compendi vuoti**: Riavvia Foundry VTT
2. **Tracker infamia non appare**: Crea nuovo personaggio
3. **Comandi non funzionano**: Verifica attivazione modulo

### Debug Console
```javascript
// Verifica attivazione modulo
game.modules.get('brancalonia-bigat')

// Verifica sistemi attivi
game.brancalonia?.infamiaTracker
game.brancalonia?.havenSystem
game.brancalonia?.dirtyJobs

// Reset sistemi se necessario
game.brancalonia?.resetSystems()
```

## 📞 Supporto

- **🐛 Bug**: [GitHub Issues](https://github.com/lordbanana89/brancalonia-bigat-master/issues)
- **💬 Discussioni**: Discord Brancalonia #foundry-vtt
- **📖 Manuale**: Consulta i compendi **Regole** per meccaniche dettagliate

---

**Buon divertimento nel Regno di Taglia!** 🎭🍷

