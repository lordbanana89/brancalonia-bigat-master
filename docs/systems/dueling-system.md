# ⚔️ Sistema Duelli - Brancalonia

Il Sistema Duelli permette combattimenti formali d'onore, sfide rituali e scontri codificati nel Regno di Taglia.

## 🏆 Tipologie di Duello

### Al Primo Sangue
- **Termine**: Al primo colpo che causa danno
- **Durata**: Massimo 5 round
- **Letale**: No (solo ferite superficiali)
- **Magia**: Non consentita
- **Armi**: Solo armi bianche
- **Ricompensa**: Vincitore -5 infamia, +10 reputazione

### Alla Sottomissione
- **Termine**: Quando uno si arrende
- **Durata**: Massimo 10 round
- **Letale**: No (resa prima della morte)
- **Magia**: Non consentita
- **Armi**: Armi bianche consentite
- **Ricompensa**: Vincitore -3 infamia, +15 reputazione

### All'Ultimo Respiro
- **Termine**: Morte di uno dei duellanti
- **Durata**: Finché uno non muore
- **Letale**: Sì (combattimento mortale)
- **Magia**: Consentita se concordata
- **Armi**: Tutte le armi consentite
- **Ricompensa**: Vincitore +20 reputazione, perdente morte

## ⚔️ Stili di Combattimento

### Spada e Pugnale (Classico Italiano)
- **Armi**: Spada + pugnale
- **Stile**: Difensivo, contrattacchi
- **Bonus**: +1 CA, possibilità contrattacco
- **Storico**: Stile tradizionale italiano

### Spada e Scudo
- **Armi**: Spada + scudo
- **Stile**: Difensivo, protezione
- **Bonus**: +2 CA, scudo come reazione
- **Storico**: Stile legionario romano

### Due Armi
- **Armi**: Due armi leggere
- **Stile**: Aggressivo, doppio attacco
- **Bonus**: Attacco bonus con seconda arma
- **Storico**: Stile barbaro/guerriero

### Arma a Due Mani
- **Armi**: Arma a due mani (spadone, ascia)
- **Stile**: Potente, danni elevati
- **Bonus**: +2 danni, -1 CA
- **Storico**: Stile cavaliere medievale

### Arma da Fuoco (Moderna)
- **Armi**: Pistola, moschetto
- **Stile**: Ranged, preciso
- **Bonus**: Attacco a distanza, ricarica lenta
- **Storico**: Era rinascimentale

## 🎯 Meccaniche di Duello

### Iniziazione Duello
```javascript
// Sistema iniziazione duello
const duelConfig = {
  type: 'primo_sangue',           // Tipo duello
  style: 'sword_dagger',          // Stile combattimento
  location: 'piazza_centrale',    // Luogo duello
  witnesses: ['capitano_guardia', 'nobile_locale'],
  rules: {
    maxRounds: 5,
    lethal: false,
    magicAllowed: false,
    rangedAllowed: false
  }
};
```

### Round di Combattimento
- **Iniziativa**: Tiro iniziativa normale
- **Attacchi**: Attacchi standard D&D 5e
- **Condizioni Speciali**: Svantaggio per stanchezza
- **Termine**: Condizioni specifiche del tipo duello

### Eventi Speciali
Durante il duello possono verificarsi eventi:

- **Spettatori Interrompono**: Duello interrotto
- **Intervento Autorità**: Guardie fermano duello illegale
- **Scommessa Pubblico**: Spettatori scommettono
- **Evento Ambientale**: Pioggia, vento, folla

## 🛡️ Regole di Condotta

### Codice d'Onore
- **Sfida Formale**: Duello deve essere concordato
- **Scelta Armi**: Armi devono essere equivalenti
- **Testimoni**: Almeno 2 testimoni necessari
- **Rispetto Vincitore**: Perdente deve accettare sconfitta

### Punizioni per Violazioni
- **Duello Illegale**: +10 infamia
- **Uso Magia Proibita**: +15 infamia, possibile esecuzione
- **Omicidio Dopo Resa**: +20 infamia, taglia massima
- **Rifiuto Sfida Onore**: -10 reputazione

## 🎭 Eventi di Duello

### Duelli Pianificati
- **Duelli d'Onore**: Sfide formali per onore
- **Duelli di Vendetta**: Risoluzione faide familiari
- **Duelli Sportivi**: Tornei e competizioni
- **Duelli Giudiziari**: Processi per combattimento

### Duelli Improvvisi
- **Sfide da Taverna**: Lite diventa duello
- **Duelli di Strada**: Scontri territoriali
- **Duelli di Frontiera**: Dispute tra compagnie

## 💰 Scommesse e Spettacolo

### Sistema Scommesse
- **Bookmaker**: NPC che gestisce scommesse
- **Quote**: Basate su reputazione duellanti
- **Vincita**: 2:1 per sfavorito, 1:1 per favorito
- **Truffa**: Possibilità combine e imbrogli

### Eventi Speciali
- **Tornei**: Competizioni con premi
- **Spettacoli**: Duelli per pubblico pagante
- **Sfide Celebri**: Duelli che attirano folla

## 📊 Integrazione Sistemi

### Infamia e Reputazione
- **Duello Vinto**: -5 infamia, +10/+20 reputazione
- **Duello Perso**: Nessuna modifica infamia (onore mantenuto)
- **Duello Illegale**: +10 infamia
- **Codice Violato**: +15 infamia

### Compagnia
- **Duelli di Compagnia**: Rappresentanza compagnia
- **Sfide Inter-Compagnia**: Rivalità tra gruppi
- **Onore Collettivo**: Reputazione compagnia influenzata

### Fazioni
- **Campioni Fazione**: Duellanti rappresentano fazioni
- **Duelli Politici**: Risoluzione dispute politiche
- **Alleanze tramite Duelli**: Duelli per suggellare patti

## 🏟️ Luoghi per Duelli

### Luoghi Tradizionali
- **Piazza Centrale**: Duelli pubblici cittadini
- **Arena Locale**: Spazi dedicati ai combattimenti
- **Campo d'Onore**: Spazi sacri per duelli formali
- **Frontiera**: Duelli in terre di confine

### Luoghi Speciali
- **Cimiteri Antichi**: Duelli spettrali
- **Rovine Maledette**: Duelli con interferenze magiche
- **Palazzi Nobiliari**: Duelli per l'élite
- **Taverne**: Duelli improvvisati da taverna

## 🎮 Comandi Duello

### Gestione Duelli
```
/duello start <avversario1> <avversario2> <tipo>    # Inizia duello
/duello accept <id>                                # Accetta sfida
/duello decline <id>                               # Rifiuta sfida
/duello status                                     # Duelli attivi
/duello rules <tipo>                               # Regole duello
/duello styles                                     # Stili disponibili
/duello locations                                  # Luoghi duello
/duello events                                     # Eventi duello
```

### Durante Duello
```
/duello attack <bersaglio>                         # Attacco normale
/duello defend                                     # Difesa speciale
/duello special <mossa>                            # Mossa speciale stile
/duello surrender                                  # Arrenditi
/duello continue                                   # Continua duello
```

## ⚙️ Configurazione

### Regole Personalizzabili
- **Durata Massima**: Round massimi per tipo duello
- **Armi Consentite**: Restrizioni armi per stile
- **Magia Abilitata**: Se magia consentita
- **Testimoni Richiesti**: Numero minimo testimoni

### Eventi Speciali
- **Tornei Automatici**: Eventi ricorrenti
- **Sfide Celebri**: Duelli speciali leggendari
- **Intervento Fazioni**: Fazioni intervengono in duelli

## 📈 Analytics

### Statistiche Tracciate
- **Duelli Totali**: Numero duelli combattuti
- **Vittorie per Stile**: Performance per stile combattimento
- **Duelli per Luogo**: Luoghi più usati
- **Eventi Speciali**: Eventi durante duelli

### Report Disponibili
```javascript
// Report duelli settimanale
game.brancalonia.analytics.generateDuelingReport()

// Statistiche giocatore
game.brancalonia.analytics.getPlayerDuelingStats(actor)
```

---

Il Sistema Duelli aggiunge onore, strategia e rischio al combattimento, permettendo ai giocatori di risolvere dispute in modo civile (o meno civile) nel Regno di Taglia.

