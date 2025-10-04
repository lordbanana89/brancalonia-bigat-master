# 🏴‍☠️ Sistema Compagnia - Brancalonia

Il Sistema Compagnia permette ai giocatori di formare e gestire gruppi organizzati di tagliagole nel Regno di Taglia.

## 👥 Struttura della Compagnia

### Gerarchia Interna
```
📊 CAPITANO (Leader)
├── 🔹 LUOGOTENENTI (2-3 membri fidati)
├── ⚔️ SOLDATI (Membri attivi)
└── 🏃‍♂️ RECLUTE (Nuovi arrivati)
```

### Requisiti per Compagnia
- **Minimo 3 membri** per formare compagnia
- **Massimo 6 membri** per compagnia attiva
- **Compagnia singola** per personaggio
- **Gerarchia definita** (capitano obbligatorio)

## 🎯 Meccaniche di Gioco

### Reputazione Condivisa
```javascript
// Calcolo reputazione compagnia
compagnia.reputation = members.reduce((sum, member) => sum + member.reputation, 0) / members.length;

// Influenza infamia individuale
if (compagnia.reputation < 25) {
  // Bonus negativo per membri
  member.infamia += 5;
} else if (compagnia.reputation > 75) {
  // Bonus positivo per membri
  member.infamia -= 3;
}
```

### Risorse Comuni
- **Tesoro Condiviso**: Oro e oggetti di valore
- **Equipaggiamento**: Armi e armature comuni
- **Contatti**: Rete relazioni compagnia
- **Rifugi**: Luoghi sicuri condivisi

## 🏠 Compagnia e Haven

### Integrazione Rifugi
- **Haven Principale**: Base operativa compagnia
- **Stanze Condivise**: Stanze usufruibili da tutti i membri
- **Sicurezza Collettiva**: Difese condivise
- **Eventi di Compagnia**: Eventi che coinvolgono tutti

### Bonus Compagnia per Haven
- **Sconto Costruzione**: -20% costi per membri compagnia
- **Difesa Bonus**: +2 membri compagnia = +1 sicurezza
- **Eventi Ridotti**: -30% probabilità eventi negativi

## 💰 Economia della Compagnia

### Divisione Ricompense
```javascript
// Sistema divisione automatica
const totalReward = 1000; // Ricompensa lavoro
const memberCount = compagnia.members.length;

const sharePerMember = Math.floor(totalReward / memberCount);
const captainBonus = Math.floor(totalReward * 0.2); // 20% extra capitano

// Distribuzione
capitano.gold += sharePerMember + captainBonus;
members.forEach(member => {
  member.gold += sharePerMember;
});
```

### Fondo Comune
- **Contributi Obbligatori**: 10% di ogni ricompensa
- **Fondo Emergenze**: Per cure, cauzioni, riparazioni
- **Investimenti Collettivi**: Miglioramenti haven, equipaggiamento

## ⚔️ Compagnia in Combattimento

### Formazioni di Combattimento
- **Formazione Stretta**: +1 CA, movimento ridotto
- **Formazione Allargata**: +1 attacco, vulnerabile
- **Formazione Difensiva**: +2 CA, -1 danno

### Abilità di Compagnia
- **Attacco Coordinato**: Bonus +2 se tutti attaccano stesso bersaglio
- **Difesa Reciproca**: Reazione per parare colpo compagno
- **Fuga Organizzata**: Ritirata coordinata senza panico

## 📊 Reputazione della Compagnia

### Livelli di Reputazione
| Livello | Nome | Benefici |
|---------|------|----------|
| **0-25** | Sconosciuti | Nessun beneficio |
| **25-50** | Poco Note | Sconti mercanti 10% |
| **50-75** | Rispettate | Accesso locande migliori |
| **75-100** | Famigerate | Paura nei nemici, taglie alte |

### Eventi di Reputazione
- **Vittorie Comuni**: +5 reputazione per lavoro riuscito
- **Sconfitte Comuni**: -3 reputazione per fallimento
- **Azioni Eroiche**: +10 reputazione per gesta memorabili
- **Tradimenti**: -20 reputazione, possibile scioglimento

## 🏛️ Relazioni con Fazioni

### Alleanze Possibili
- **Chiesa Calendaria**: Protezione religiosa
- **Nobiltà Locale**: Patrocinio aristocratico
- **Gilde Mercantili**: Opportunità commerciali
- **Ordine Draconiano**: Supporto militare

### Benefici Alleanza
```javascript
// Bonus alleanza attiva
if (compagnia.alliedFactions.includes('chiesa_calendaria')) {
  members.forEach(member => {
    member.bonuses.healing += 2; // +2 cure divine
    member.resistances.charm += 1; // Resistenza charme
  });
}
```

## 🎮 Gestione Compagnia

### Comandi Disponibili
```
/compagnia create <nome>        # Crea nuova compagnia
/compagnia join <nome>          # Unisciti a compagnia esistente
/compagnia leave                # Abbandona compagnia
/compagnia promote <membro>     # Promuovi membro
/compagnia demote <membro>      # Retrocedi membro
/compagnia kick <membro>        # Espelli membro
/compagnia status               # Stato compagnia completo
/compagnia treasury             # Mostra tesoro condiviso
/compagnia reputation           # Mostra reputazione compagnia
```

### Interfaccia GM
- **Lista Compagnie**: Tutte le compagnie attive nel mondo
- **Modifica Membri**: Aggiungi/rimuovi membri direttamente
- **Gestione Eventi**: Eventi speciali per compagnie
- **Statistiche**: Performance e andamento compagnie

## 🏆 Achievement di Compagnia

### Traguardi Collettivi
- **Prima Compagnia**: Prima compagnia formata nel mondo
- **Compagnia Longeva**: Sopravvissuta 1 anno di gioco
- **Ricca**: Tesoro superiore a 10.000 mo
- **Famosa**: Reputazione superiore a 90
- **Invitta**: Nessun membro morto in missione

### Ricompense Achievement
- **Titoli Nobiliari**: Per capitano compagnia famosa
- **Terre**: Possesso di terre per compagnia longeva
- **Immunità**: Riduzione tasse e controlli
- **Onori Speciali**: Accesso eventi esclusivi

## ⚙️ Configurazione Avanzata

### Regole Personalizzabili
```javascript
// Personalizzazione regole compagnia (solo GM)
game.settings.set('brancalonia-bigat', 'compagniaRules', {
  maxMembers: 8,              // Massimo membri
  minMembers: 2,              // Minimo per formare
  captainBonus: 0.25,         // Bonus capitano (25%)
  commonFund: 0.15,           // Fondo comune (15%)
  reputationShare: true,      // Condividi reputazione
  infamiaShare: true          // Condividi infamia
});
```

### Eventi Speciali
- **Feste Compagnia**: Eventi sociali mensili
- **Riunioni Strategiche**: Pianificazione operazioni
- **Cerimonie**: Promozioni e giuramenti
- **Crisi**: Tradimenti, morti, sconfitte

## 🐛 Debugging e Troubleshooting

### Debug Console
```javascript
// Controlla compagnie esistenti
game.brancalonia.compagniaManager.getAllCompagnie()

// Stato compagnia specifica
game.brancalonia.compagniaManager.getCompagniaByName('nome')

// Reset compagnia
game.brancalonia.compagniaManager.resetCompagnia('nome')

// Forza eventi
game.brancalonia.compagniaManager.triggerCompagniaEvent('nome')
```

### Problemi Comuni
1. **Compagnia non visibile**: Verifica attivazione sistema
2. **Membri non sincronizzati**: Riavvia mondo
3. **Tesoro non condiviso**: Controlla permessi

## 📊 Analytics e Statistiche

### Metriche Tracciate
- **Compagnie Totali**: Numero compagnie formate
- **Durata Media**: Tempo sopravvivenza compagnie
- **Performance**: Success rate missioni
- **Crescita**: Andamento membri e reputazione

### Report Settimanali
```javascript
// Genera report compagnie
game.brancalonia.analytics.generateCompagniaReport()

// Statistiche dettagliate
game.brancalonia.analytics.getCompagniaStats()
```

## 🔗 Integrazione Altri Sistemi

### Sistema Infamia
- **Reputazione Condivisa**: Influenza infamia membri
- **Eventi Collegati**: Eventi infamia coinvolgono compagnia

### Sistema Haven
- **Base Condivisa**: Haven principale compagnia
- **Risorse Comuni**: Stanze usufruibili collettivamente

### Sistema Lavori Sporchi
- **Missioni di Compagnia**: Lavori per tutta la compagnia
- **Divisione Ricompense**: Sistema automatico divisione

### Sistema Duelli
- **Duelli di Compagnia**: Sfide tra compagnie rivali
- **Onore Collettivo**: Reputazione duelli influenza compagnia

---

Il Sistema Compagnia aggiunge profondità sociale e strategica al gioco, permettendo ai giocatori di costruire alleanze durature e organizzazioni criminali nel Regno di Taglia.

