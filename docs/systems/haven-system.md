# 🏰 Sistema Haven - Brancalonia

Il Sistema Haven permette ai giocatori di creare e gestire rifugi, basi segrete e nascondigli nel Regno di Taglia.

## 🏗️ Tipologie di Haven

### Basi Disponibili

#### Osteria/Locanda
- **Costo Base**: 500 mo
- **Capacità**: 10 persone
- **Benefici**: Informazioni, contatti, riparo
- **Rischi**: Clienti indiscreti, controlli autorità

#### Magazzino Abbandonato
- **Costo Base**: 200 mo
- **Capacità**: 20 persone
- **Benefici**: Spazio, nascondigli, deposito
- **Rischi**: Crolli, topi, vicini curiosi

#### Palazzo Nobiliare
- **Costo Base**: 2000 mo
- **Capacità**: 15 persone
- **Benefici**: Lusso, sicurezza, prestigio
- **Rischi**: Attenzione nobiltà, tasse elevate

#### Grotta Naturale
- **Costo Base**: 100 mo
- **Capacità**: 8 persone
- **Benefici**: Nascondiglio perfetto, risorse naturali
- **Rischi**: Instabilità, animali selvatici

#### Torre Isolata
- **Costo Base**: 800 mo
- **Capacità**: 6 persone
- **Benefici**: Vedetta, difesa naturale
- **Rischi**: Isolamento, tempeste

#### Monastero Abbandonato
- **Costo Base**: 600 mo
- **Capacità**: 12 persone
- **Benefici**: Atmosfera mistica, protezione divina
- **Rischi**: Spiriti, maledizioni

## 🏠 Stanze e Miglioramenti

### Stanze Base

#### Dormitorio
- **Costo**: 100 mo
- **Benefici**: +1 dado vita per riposo lungo
- **Miglioramenti**: Letti di qualità, riscaldamento

#### Cucina
- **Costo**: 150 mo
- **Benefici**: +2 HP, rimuove sfinimento
- **Miglioramenti**: Forno professionale, dispensa

#### Armeria
- **Costo**: 200 mo
- **Benefici**: 50% sconto riparazioni
- **Miglioramenti**: Forgia, attrezzi speciali

#### Laboratorio
- **Costo**: 300 mo
- **Benefici**: Pozioni, veleni, esperimenti
- **Miglioramenti**: Alambicchi, biblioteca alchemica

#### Biblioteca
- **Costo**: 250 mo
- **Benefici**: +2 conoscenze, ricerca
- **Miglioramenti**: Libri rari, studio privato

#### Cappella
- **Costo**: 200 mo
- **Benefici**: Cure divine, benedizioni
- **Miglioramenti**: Altare sacro, reliquie

### Stanze Avanzate

#### Stalla
- **Costo**: 150 mo
- **Benefici**: Cavalli, trasporti, animali
- **Miglioramenti**: Stallaggi rinforzati

#### Magazzino
- **Costo**: 100 mo
- **Benefici**: Deposito sicuro, nascondigli
- **Miglioramenti**: Serrature magiche

#### Officina
- **Costo**: 180 mo
- **Benefici**: Costruzioni, riparazioni avanzate
- **Miglioramenti**: Attrezzi speciali

#### Cucce
- **Costo**: 120 mo
- **Benefici**: Animali da guardia, sicurezza
- **Miglioramenti**: Cani da guerra

#### Prigione
- **Costo**: 200 mo
- **Benefici**: Celle per prigionieri
- **Miglioramenti**: Strumenti interrogatorio

#### Torre
- **Costo**: 300 mo
- **Benefici**: Vedetta, difesa a distanza
- **Miglioramenti**: Arco, balista

#### Segrete
- **Costo**: 150 mo
- **Benefici**: Torture, interrogatori
- **Miglioramenti**: Strumenti specializzati

#### Sala del Trono
- **Costo**: 500 mo
- **Benefici**: Status sociale, comando
- **Miglioramenti**: Trono decorato, arazzi

## ⚙️ Meccaniche di Gioco

### Eventi Settimanali
Ogni settimana il rifugio genera eventi casuali:

```javascript
// Eventi possibili
const eventi = [
  'visitatore_misterioso',
  'problema_manutenzione',
  'scoperta_tesoro',
  'spia_infiltrata',
  'cliente_ricco',
  'problema_vicini',
  'evento_soprannaturale',
  'opportunita_commerciale'
];
```

### Sicurezza del Rifugio
- **Livello Base**: Sicurezza iniziale (1-10)
- **Stanze Difensive**: +1 sicurezza per torre, cucce, prigione
- **Membri Compagnia**: +1 sicurezza ogni 2 membri
- **Reputazione**: Alta reputazione = +2 sicurezza

### Costi di Manutenzione
```javascript
// Calcolo manutenzione settimanale
const baseMaintenance = 50; // Costo base
const roomMaintenance = stanze.length * 10; // Per stanza
const securityMaintenance = sicurezza * 5; // Per sicurezza

const totalMaintenance = baseMaintenance + roomMaintenance + securityMaintenance;
```

## 🎮 Gestione Haven

### Comandi Disponibili
```
/haven create <nome> <tipo>     # Crea nuovo rifugio
/haven upgrade <stanza>         # Migliora stanza esistente
/haven status                   # Stato rifugio completo
/haven rooms                    # Lista stanze disponibili
/haven events                   # Eventi settimanali
/haven visitors                 # Visitatori attuali
/haven security                 # Livello sicurezza
/haven maintenance              # Costi manutenzione
/haven improve <stanza>         # Migliora stanza specifica
```

### Interfaccia GM
- **Mappa Haven**: Visualizzazione struttura rifugio
- **Gestione Eventi**: Eventi speciali e casuali
- **Visitatori NPC**: Gestione visitatori automatici
- **Manutenzione**: Costi e riparazioni

## 🏆 Benefici per Livello

### Livelli Sviluppo Haven
| Livello | Nome | Benefici |
|---------|------|----------|
| **1-2** | Nascondiglio | +1 sicurezza, eventi base |
| **3-4** | Base Operativa | +2 sicurezza, eventi avanzati |
| **5-6** | Fortezza | +3 sicurezza, eventi speciali |
| **7-8** | Roccaforte | +4 sicurezza, eventi leggendari |
| **9-10** | Leggenda | +5 sicurezza, protezione totale |

### Eventi Speciali per Livello
- **Livello 3+**: Possibilità clienti ricchi
- **Livello 5+**: Possibilità alleati potenti
- **Livello 7+**: Possibilità eventi leggendari
- **Livello 10**: Protezione divina/arcana

## 💰 Economia del Haven

### Costi Costruzione
```javascript
// Costi per tipo haven
const costiBase = {
  tavern: 500,
  warehouse: 200,
  manor: 2000,
  cave: 100,
  tower: 800,
  monastery: 600
};

// Moltiplicatore stanze
const costoStanza = stanzaType => {
  const costiStanze = {
    dormitory: 100, kitchen: 150, armory: 200,
    laboratory: 300, library: 250, chapel: 200
  };
  return costiStanze[stanzaType] || 100;
};
```

### Reddito del Haven
- **Locanda**: 2d6×10 mo settimanali
- **Magazzino**: 1d6×5 mo settimanali (deposito)
- **Palazzo**: 3d6×20 mo settimanali (noleggio)
- **Altri**: 1d6×5 mo settimanali

## 🛡️ Difesa e Sicurezza

### Sistema Allarmi
- **Allarme Base**: CD 12 percezione per scoprire
- **Allarme Avanzato**: CD 15, attiva difese
- **Allarme Magico**: CD 18, allerta istantanea

### Difese Attive
- **Trappole**: Danni automatici intrusi
- **Animali Guardia**: Attacco intrusi
- **Guardie NPC**: Difensori assoldati
- **Magie Protettive**: Incantesimi di allarme

## 🎭 Eventi e Visitatori

### Eventi Settimanali
```javascript
// Eventi possibili
const weeklyEvents = {
  // Eventi positivi
  cliente_ricco: 'Mercante offre lavoro ben pagato',
  alleato_potente: 'Nobile cerca alleanza',
  scoperta_tesoro: 'Tesoro nascosto nelle fondamenta',

  // Eventi negativi
  problema_strutturale: 'Riparazione urgente necessaria',
  vicina_curioso: 'Vicino sospetta attività',
  spia_infiltrata: 'Spia scoperta nel rifugio',

  // Eventi neutrali
  visitatore_misterioso: 'Straniero chiede rifugio',
  voce_circola: 'Voci su attività sospette'
};
```

### Visitatori Speciali
- **Cacciatori di Taglie**: Cercano membri compagnia
- **Mercanti**: Offrono affari vantaggiosi
- **Nobili**: Propongono alleanze politiche
- **Religiosi**: Cercano conversione o benedizioni
- **Criminali**: Propongono lavori sporchi

## 🏅 Achievement Haven

### Traguardi Rifugio
- **Primo Rifugio**: Primo haven creato nel mondo
- **Rifugio Sicuro**: Livello sicurezza 10
- **Rifugio Ricco**: Reddito settimanale 200+ mo
- **Rifugio Leggendario**: Eventi leggendari completati

### Ricompense Achievement
- **Titolo Proprietà**: Documento ufficiale proprietà
- **Immunità Locale**: Nessun controllo autorità
- **Clientela Fissa**: Reddito garantito
- **Fama Locale**: Rispetto comunità locale

## ⚙️ Configurazione Avanzata

### Regole Personalizzabili
```javascript
// Personalizzazione regole haven (solo GM)
game.settings.set('brancalonia-bigat', 'havenRules', {
  maxRooms: 14,              // Massimo stanze per haven
  maintenanceMultiplier: 1.0, // Moltiplicatore manutenzione
  eventFrequency: 1.0,       // Frequenza eventi settimanali
  securityBonus: 1,          // Bonus sicurezza base
  constructionDiscount: 0.0  // Sconto costruzione (%)
});
```

### Eventi Speciali
- **Festival Locali**: Eventi stagionali speciali
- **Crisi Regionali**: Eventi che coinvolgono zona
- **Opportunità Uniche**: Occasioni irripetibili

## 🐛 Debugging e Troubleshooting

### Debug Console
```javascript
// Lista tutti i rifugi
game.brancalonia.havenSystem.getAllHavens()

// Stato rifugio specifico
game.brancalonia.havenSystem.getHavenByName('nome')

// Eventi attivi
game.brancalonia.havenSystem.getActiveEvents()

// Calcola manutenzione
game.brancalonia.havenSystem.calculateMaintenance('nome')
```

### Problemi Comuni
1. **Haven non visibile**: Verifica attivazione sistema
2. **Eventi non generati**: Controlla frequenza eventi
3. **Costi sbagliati**: Verifica impostazioni mondo

## 📊 Analytics e Statistiche

### Metriche Tracciate
- **Haven Totali**: Numero rifugi creati
- **Tipi Preferiti**: Statistiche tipi rifugio
- **Durata Media**: Tempo sopravvivenza rifugi
- **Redditività**: Guadagni medi settimanali

### Report Disponibili
```javascript
// Report settimanale haven
game.brancalonia.analytics.generateHavenReport()

// Statistiche dettagliate
game.brancalonia.analytics.getHavenStats()
```

## 🔗 Integrazione Altri Sistemi

### Sistema Compagnia
- **Haven Condiviso**: Base operativa compagnia
- **Sicurezza Collettiva**: Membri compagnia difendono insieme

### Sistema Infamia
- **Nascondiglio Sicuro**: Riduce effetti infamia alta
- **Rete Informatori**: Informazioni su taglie

### Sistema Lavori Sporchi
- **Base Operativa**: Punto partenza missioni
- **Deposito Refurtiva**: Luogo sicuro per bottino

### Sistema Duelli
- **Campo Duelli**: Spazio per duelli formali
- **Arena Privata**: Duelli interni compagnia

---

Il Sistema Haven aggiunge profondità strategica permettendo ai giocatori di costruire basi permanenti e sviluppare infrastrutture nel Regno di Taglia.

