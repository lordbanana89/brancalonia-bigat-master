# 💼 Sistema Lavori Sporchi - Brancalonia

Il Sistema Lavori Sporchi permette ai giocatori di intraprendere missioni criminali e attività illegali nel Regno di Taglia.

## 🎯 Tipologie di Lavoro

### Rapina (Robbery)
- **Facile**: CD 12, Ricompensa 2d6×10 mo, Infamia +3
- **Media**: CD 15, Ricompensa 4d6×10 mo, Infamia +5
- **Difficile**: CD 18, Ricompensa 8d6×10 mo, Infamia +8

**Abilità richieste**: Destrezza, Furtività, Rapidità di Mano

### Estorsione (Extortion)
- **Facile**: CD 10, Ricompensa 1d6×10 mo, Infamia +2
- **Media**: CD 13, Ricompensa 2d6×10 mo, Infamia +3
- **Difficile**: CD 16, Ricompensa 4d6×10 mo, Infamia +5

**Abilità richieste**: Carisma, Intimidire, Persuasione

### Contrabbando (Smuggling)
- **Facile**: CD 11, Ricompensa 3d6×10 mo, Infamia +1
- **Media**: CD 14, Ricompensa 6d6×10 mo, Infamia +2
- **Difficile**: CD 17, Ricompensa 10d6×10 mo, Infamia +4

**Abilità richieste**: Saggezza, Inganno, Sopravvivenza

### Altri Lavori Disponibili
- **Assassinio**: Uccisioni mirate
- **Rapimento**: Sequestri di persona
- **Furto con Scasso**: Intrusion in edifici
- **Truffa**: Inganni elaborati

## ⚙️ Meccaniche di Gioco

### Generazione Lavori
```javascript
// Sistema generazione dinamica
const jobTypes = ['robbery', 'extortion', 'smuggling', 'assassination'];
const difficulties = ['easy', 'medium', 'hard'];

const randomJob = jobTypes[Math.floor(Math.random() * jobTypes.length)];
const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

const job = generateJob(randomJob, randomDifficulty);
```

### Sistema Complicazioni
Ogni lavoro può avere complicazioni che aumentano difficoltà:

```javascript
const complications = [
  'Guardie allertate',
  'Bottino maledetto',
  'Testimone oculare',
  'Refurtiva marchiata',
  'Complice traditore',
  'Guardie corrotte',
  'Vittima importante',
  'Concorrenza sleale'
];
```

## 🎲 Sistema di Risoluzione

### Tiri di Abilità
```javascript
// Esempio rapina
const roll = await actor.rollSkill('dex'); // Destrezza
const dc = job.difficulty === 'easy' ? 12 : job.difficulty === 'medium' ? 15 : 18;

if (roll.total >= dc) {
  // Successo - ottieni ricompensa
  await addInfamia(actor, job.infamia);
  await addGold(actor, job.reward);
} else {
  // Fallimento - possibili conseguenze
  await triggerComplications(job.complications);
}
```

### Eventi durante il Lavoro
Durante ogni lavoro possono verificarsi eventi casuali:

- **Evento Positivo**: Bonus ricompensa, alleato inaspettato
- **Evento Neutrale**: Informazione utile, incontro neutrale
- **Evento Negativo**: Guardia, testimone, complicazione

## 💰 Sistema Ricompense

### Ricompense Base
```javascript
// Ricompense per difficoltà
const baseRewards = {
  robbery: { easy: '2d6*10', medium: '4d6*10', hard: '8d6*10' },
  extortion: { easy: '1d6*10', medium: '2d6*10', hard: '4d6*10' },
  smuggling: { easy: '3d6*10', medium: '6d6*10', hard: '10d6*10' }
};
```

### Modificatori Ricompensa
- **Abilità Speciali**: +20% ricompensa per successo critico
- **Compagnia**: +10% ricompensa se lavoro di compagnia
- **Reputazione**: +/- 15% basato su reputazione fazione
- **Territorio**: +/- 25% basato su zona (città vs campagna)

## 🚨 Sistema Conseguenze

### Fallimenti Possibili
- **Cattura**: Prigione e processo
- **Ferite**: Danni fisici
- **Infamia**: Aumento notorietà
- **Taglia**: Cacciatori di taglie attivati
- **Ritorsione**: Vittima cerca vendetta

### Complicazioni Comuni
```javascript
const complications = {
  'guardie_allertate': 'Guardie arrivano in 1d4 round',
  'bottino_maledetto': 'Oggetto maledetto causa problemi',
  'testimone_oculare': 'Qualcuno ti ha visto chiaramente',
  'refurtiva_marchiata': 'Oggetti facilmente tracciabili',
  'complice_traditore': 'Alleato vende informazioni',
  'guardie_corrotte': 'Guardie chiedono tangente',
  'vittima_importante': 'Persona influente cerca vendetta',
  'concorrenza_sleale': 'Altri criminali interferiscono'
};
```

## 📊 Integrazione Sistemi

### Compagnia
- **Lavori di Compagnia**: Missioni per tutta la compagnia
- **Divisione Ricompense**: Sistema automatico divisione oro
- **Reputazione Collettiva**: Influenza reputazione gruppo

### Haven
- **Base Operativa**: Punto partenza per missioni
- **Deposito Sicuro**: Luogo sicuro per bottino
- **Rete Informatori**: Informazioni su lavori disponibili

### Infamia
- **Infamia Automatica**: Ogni lavoro aumenta infamia
- **Infamia Ridotta**: Alcuni lavori aumentano meno infamia
- **Taglie Attivate**: Infamia alta attiva cacciatori

## 🏆 Sistema Progressione

### Livelli Criminali
| Livello | Nome | Benefici |
|---------|------|----------|
| **1-10** | Principiante | Lavori base disponibili |
| **11-25** | Apprendista | Lavori medi, meno complicazioni |
| **26-50** | Esperto | Lavori difficili, ricompense +25% |
| **51-75** | Maestro | Lavori leggendari, clienti speciali |
| **76-100** | Leggenda | Lavori unici, reputazione criminale |

### Specializzazioni Criminali
- **Specialista Rapine**: +2 ai tiri rapina, meno guardie
- **Maestro Estorsioni**: +2 persuasione, vittime pagano di più
- **Esperto Contrabbando**: +2 sopravvivenza, meno controlli

## 🎮 Comandi Disponibili

### Gestione Lavori
```
/lavori generate <tipo> <difficolta>    # Genera lavoro specifico
/lavori list                           # Lista lavori disponibili
/lavori accept <id>                     # Accetta lavoro
/lavori complete <id>                   # Completa con successo
/lavori fail <id>                       # Fallisce lavoro
/lavori status                          # Stato lavori attivi
/lavori complications                   # Mostra complicazioni
/lavori rewards <id>                    # Mostra ricompensa lavoro
```

### Query e Informazioni
```
/lavori types                           # Tipi lavoro disponibili
/lavori difficulties                    # Livelli difficoltà
/lavori skills <tipo>                   # Abilità richieste
/lavori examples <tipo>                 # Esempi lavori
```

## 🛠️ Configurazione

### Impostazioni Lavori
- **Frequenza Generazione**: Ogni quanto generare lavori
- **Ricompense Base**: Moltiplicatore ricompense
- **Complicazioni**: Probabilità complicazioni
- **Infamia Base**: Infamia per lavori standard

### Tipi Lavoro Attivi
- **Rapine**: Abilitate/disabilitate
- **Estorsioni**: Abilitate/disabilitate
- **Contrabbando**: Abilitate/disabilitate
- **Assassinii**: Abilitate/disabilitate

## 📈 Analytics e Report

### Statistiche Tracciate
- **Lavori Completati**: Success rate per tipo
- **Guadagni Totali**: Oro guadagnato da lavori sporchi
- **Infamia Guadagnata**: Infamia da attività criminali
- **Complicazioni Incontrate**: Eventi negativi frequenza

### Report Disponibili
```javascript
// Report settimanale lavori
game.brancalonia.analytics.generateDirtyJobsReport()

// Statistiche giocatore
game.brancalonia.analytics.getPlayerDirtyJobsStats(actor)
```

## 🐛 Debugging

### Comandi Debug
```javascript
// Forza generazione lavoro
game.brancalonia.dirtyJobs.forceGenerateJob('robbery', 'hard')

// Lista lavori attivi
game.brancalonia.dirtyJobs.getActiveJobs()

// Reset sistema lavori
game.brancalonia.dirtyJobs.resetSystem()
```

---

Il Sistema Lavori Sporchi aggiunge rischio e ricompensa al gioco, permettendo ai giocatori di vivere come veri criminali nel Regno di Taglia.

