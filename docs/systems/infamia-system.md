# 🎭 Sistema Infamia - Brancalonia

Il Sistema Infamia è il cuore meccanico di Brancalonia, che determina la reputazione e notorietà dei personaggi nel Regno di Taglia.

## 📊 Meccanica Base

### Sistema a Livelli (0-100 punti)
L'infamia è un valore numerico da 0 a 100+ che determina la notorietà del personaggio:

| Livello | Nome | Effetti Meccanici |
|---------|------|-------------------|
| **0-10** | Sconosciuto | Nessun effetto |
| **10-25** | Poco Noto | Sconti 10% dai criminali |
| **25-50** | Mal Visto | -1 Persuasione con autorità |
| **50-75** | Ricercato | Taglie minori (50-200 mo) |
| **75-100** | Fuorilegge | Bandito dalle città, cacciatori di taglie |
| **100+** | Nemico Pubblico | Kill on sight, taglie enormi (5000+ mo) |

## ⚖️ Azioni che Modificano l'Infamia

### Crimini Maggiori (+5-15 punti)
- **Omicidio Nobile**: +15 punti
- **Tradimento**: +10 punti
- **Pirateria**: +7 punti
- **Sedizione**: +12 punti

### Crimini Medi (+3-5 punti)
- **Rapina**: +5 punti
- **Estorsione**: +3 punti
- **Furto Maggiore**: +3 punti

### Crimini Minori (+1-2 punti)
- **Furto Minore**: +1 punto
- **Rissa Pubblica**: +1 punto
- **Oltraggio Autorità**: +4 punti

### Azioni Positive (-2-5 punti)
- **Buone Azioni**: -2 punti
- **Aiuto Comunità**: -3 punti
- **Vittoria Duello Onore**: -5 punti

## 🎯 Meccaniche Avanzate

### Reputazione Condivisa (Compagnia)
```javascript
// Sistema compagnia influenza infamia
const compagniaInfamia = members.reduce((sum, member) => sum + member.infamia, 0) / members.length;
const compagniaLevel = this.calculateInfamiaLevel(compagniaInfamia);
```

### Eventi Triggerati dall'Infamia
- **Guardie Sospettose** (25+): Controlli più frequenti
- **Taglie Attive** (50+): Cacciatori di taglie iniziano ricerca
- **Bandito dalle Città** (75+): Ingresso negato nelle città
- **Kill on Sight** (100+): Ogni guardia attacca immediatamente

### Modificatori Contestuali
- **Territorio Chiesa**: +20% infamia per crimini religiosi
- **Territorio Nobili**: +15% infamia per crimini contro nobili
- **Città Libere**: -10% infamia per crimini minori

## 💾 Persistenza e Storage

### Dati Salvati
```javascript
// Struttura dati infamia
{
  _id: "actor-id",
  infamia: {
    current: 45,
    history: [30, 35, 40, 45], // Storico valori
    lastModified: "2025-01-15T10:30:00Z",
    modifiers: {
      territorio: "chiesa_calendaria",
      compagnia: "lupi_di_taglia"
    }
  }
}
```

### Sincronizzazione Multi-GM
- **Auto-sync**: Modifiche propagate automaticamente
- **Conflict Resolution**: Ultima modifica vince
- **Backup**: Snapshot ogni sessione

## 🎮 Integrazione UI

### Tracker Visivo
- **Barra Infamia**: Visualizzazione grafica livello attuale
- **Icona Livello**: Simbolo rappresentativo del livello
- **Tooltip Dettagliato**: Info completa passando mouse
- **Animazioni**: Effetti visivi per cambiamenti

### Sheet Integration
```handlebars
<!-- actor-sheet.hbs -->
<div class="infamia-tracker">
  <div class="infamia-bar" style="width: {{infamiaPercentage}}%"></div>
  <span class="infamia-level">{{currentInfamiaLevel}}</span>
  <span class="infamia-value">{{actor.system.infamia}}</span>
</div>
```

## 🔧 API per Sviluppatori

### Metodi Principali
```javascript
// API Infamia
game.brancalonia.api.infamia = {
  // Modifica infamia
  addInfamia(actor, amount, reason = '') {
    return InfamiaTracker.addInfamia(actor, amount, reason);
  },

  removeInfamia(actor, amount, reason = '') {
    return InfamiaTracker.removeInfamia(actor, amount, reason);
  },

  setInfamia(actor, value) {
    return InfamiaTracker.setInfamia(actor, value);
  },

  // Query infamia
  getInfamiaLevel(actor) {
    return InfamiaTracker.getLevel(actor);
  },

  getInfamiaEffects(actor) {
    return InfamiaTracker.getActiveEffects(actor);
  },

  // Eventi e hook
  onInfamiaChange(callback) {
    return Hooks.on('brancalonia.infamiaChanged', callback);
  }
};
```

### Eventi Disponibili
```javascript
// Eventi triggerati dal sistema
Hooks.on('brancalonia.infamiaChanged', (data) => {
  console.log('Infamia cambiata:', data);
  // { actor, oldValue, newValue, reason }
});

Hooks.on('brancalonia.infamiaLevelUp', (data) => {
  console.log('Nuovo livello infamia:', data);
  // { actor, newLevel, effects }
});
```

## ⚙️ Configurazione

### Impostazioni Disponibili
- **Abilita Sistema Infamia**: Attiva/disattiva completamente
- **Auto-calcolo Livelli**: Calcola automaticamente livelli da punti
- **Notifiche Livello**: Notifica giocatori per cambi livello
- **Storico Infamia**: Tiene traccia storico valori

### Personalizzazione Livelli
```javascript
// Personalizzare soglie livelli (solo GM)
game.settings.set('brancalonia-bigat', 'infamiaThresholds', {
  poco_noto: 8,
  mal_visto: 20,
  ricercato: 45,
  fuorilegge: 70,
  nemico_pubblico: 95
});
```

## 🐛 Debugging e Troubleshooting

### Debug Console
```javascript
// Controlla stato infamia
game.brancalonia.infamiaTracker.getDebugInfo()

// Reset infamia personaggio
game.brancalonia.infamiaTracker.resetActor(actor)

// Forza ricalcolo livelli
game.brancalonia.infamiaTracker.recalculateAllLevels()
```

### Problemi Comuni
1. **Tracker non appare**: Verifica attivazione sistema infamia
2. **Valori non si aggiornano**: Controlla permessi mondo
3. **Livelli sbagliati**: Verifica soglie configurazione

## 📈 Statistiche e Analytics

### Metriche Tracciate
- **Infamia Media**: Valore medio giocatori attivi
- **Distribuzione Livelli**: Quanti giocatori per livello
- **Trend Settimanali**: Andamento nel tempo
- **Eventi Trigger**: Eventi causati da infamia alta

### Report Disponibili
```javascript
// Genera report infamia
game.brancalonia.analytics.generateInfamiaReport()

// Esporta dati per analisi
game.brancalonia.analytics.exportInfamiaData()
```

## 🔗 Integrazione con Altri Sistemi

### Compagnia
- **Infamia Condivisa**: Influenza reputazione compagnia
- **Bonus Compagnia**: Riduce infamia per azioni di gruppo

### Haven
- **Sicurezza**: Infamia alta aumenta rischio sicurezza
- **Reputazione Locale**: Influenza accettazione rifugio

### Duelli
- **Duelli d'Onore**: Possono ridurre infamia se vinti
- **Sfide Pubbliche**: Aumentano notorietà indipendentemente

### Fazioni
- **Reputazione Fazione**: Influenza relazioni con fazioni
- **Missioni Fazione**: Possono modificare infamia

## 🎨 Personalizzazione Tema

### Colori Infamia
```css
/* CSS Variables per infamia */
--brancalonia-infamia-bg: #8B0000;      /* Rosso sangue */
--brancalonia-infamia-fill: #FF4500;    /* Arancione infamia */
--brancalonia-infamia-text: #FFFFFF;    /* Bianco */
--brancalonia-infamia-border: #FFD700;  /* Oro */
```

### Animazioni
- **Shimmer Effect**: Effetto scintillio per infamia alta
- **Pulse Warning**: Pulsazione per livelli critici
- **Color Transitions**: Transizioni fluide tra livelli

## 📚 Riferimenti e Fonti

### Manuale Brancalonia
- **Capitolo Infamia**: Pagine 45-67
- **Sistema Reputazione**: Pagine 68-72
- **Crimini e Punizioni**: Pagine 73-78

### Compatibilità D&D 5e
- **Integrazione Background**: Modifica regole background
- **Active Effects**: Usa sistema effetti standard
- **Hook Standard**: Utilizza hook ufficiali Foundry

---

Questo sistema rende Brancalonia unica nel panorama dei giochi di ruolo, con meccaniche profonde e integrate che influenzano ogni aspetto del gioco.

