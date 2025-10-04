# 🗲 Sistema Menagramo - Brancalonia

Il Sistema Menagramo rappresenta la sfortuna e le maledizioni che perseguitano i personaggi nel Regno di Taglia.

## 🎭 Cos'è il Menagramo

Il Menagramo è un sistema di sfortuna meccanica che simula le maledizioni, la iella e le conseguenze negative delle azioni dei personaggi. Non è solo narrativo, ma ha effetti tangibili sul gameplay.

## 📊 Livelli di Menagramo

### Menagramo Minore
- **Durata**: 1d4 giorni
- **Effetti**: Svantaggio su una prova di caratteristica scelta dal GM
- **Rimozione**: Ritiro sociale in monastero (1 settimana)

### Menagramo Moderato
- **Durata**: 2d4 giorni
- **Effetti**: Svantaggio su tutti i tiri di attacco e salvezza
- **Rimozione**: Pellegrinaggio a luogo sacro + offerta

### Menagramo Maggiore
- **Durata**: 3d4 giorni
- **Effetti**: Svantaggio su TUTTI i tiri (attacchi, prove, salvezza)
- **Rimozione**: Magia potente (Rimuovi Maledizione + Ristorare)

## 🏴‍☠️ Modi per Contrarre il Menagramo

### Azioni che Causano Menagramo
- **Fallire miseramente** prove importanti (naturale 1)
- **Offendere entità soprannaturali** (demoni, spiriti, divinità)
- **Romper tabù culturali** (mangiare carne venerdì, bestemmiare)
- **Essere maledetti** da streghe, spiriti o oggetti maledetti
- **Tradire giuramenti sacri** (patti di sangue, voti religiosi)

### Eventi Specifici Menagramo
```javascript
// Eventi che triggerano menagramo
const menagramoTriggers = [
  'bestemmia_divina',           // Bestemmiare contro divinità
  'rompere_specchio',          // Rompere specchio (7 anni sfortuna)
  'camminare_sotto_scala',     // Camminare sotto scala
  'aprire_ombrello_interni',   // Aprire ombrello in casa
  'passare_venerdi_13',        // Venerdì 13 sfortunato
  'incontrare_gatto_nero',      // Gatto nero attraversa strada
  'oggetto_maledetto',         // Usare oggetto maledetto
  'maledizione_strega'         // Essere maledetti da strega
];
```

## ⚙️ Effetti Meccanici

### Implementazione Active Effects
```javascript
// Effetti menagramo nel sistema
const menagramoEffects = {
  minor: {
    name: 'Menagramo Minore',
    img: 'icons/magic/death/skull-humanoid-crown-white.webp',
    effects: [
      {
        key: 'flags.midi-qol.disadvantage.ability.check',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1',
        priority: 20
      }
    ]
  },
  moderate: {
    name: 'Menagramo Moderato',
    img: 'icons/magic/death/skull-humanoid-crown-yellow.webp',
    effects: [
      {
        key: 'flags.midi-qol.disadvantage.attack.all',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1',
        priority: 20
      },
      {
        key: 'flags.midi-qol.disadvantage.save.all',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1',
        priority: 20
      }
    ]
  },
  major: {
    name: 'Menagramo Maggiore',
    img: 'icons/magic/death/skull-humanoid-crown-red.webp',
    effects: [
      {
        key: 'flags.midi-qol.disadvantage.all',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1',
        priority: 30
      }
    ]
  }
};
```

## 🎲 Eventi Casuali di Sfortuna

### Eventi Giornalieri
Ogni giorno con menagramo attivo può verificarsi un evento di sfortuna:

```javascript
const dailyMisfortunes = [
  'borsa_bucata',           // Monete cadono dalla borsa
  'cavallo_zoppo',          // Cavallo si azzoppa
  'oggetto_rotto',          // Oggetto si rompe inaspettatamente
  'incontro_sgradito',      // Incontro persona ostile
  'maltempo_improvviso',    // Pioggia o tempesta improvvisa
  'oggetto_smarrito',       // Perdita oggetto importante
  'incidente_minore',       // Ferita accidentale
  'voce_malevola'           // Voce sussurra sventure
];
```

### Eventi Critici
Eventi rari ma devastanti per menagramo maggiore:

- **Incidente Grave**: Caduta da cavallo, danno 2d6
- **Oggetto Prezioso Rotto**: Distruzione permanente oggetto
- **Tradimento Alleato**: Alleato volta le spalle
- **Maledizione Estesa**: Menagramo si estende a compagni

## 🛡️ Rimozione e Protezione

### Metodi di Rimozione

#### Spirituale
- **Preghiere**: 1 ora preghiera giornaliera (-1 giorno durata)
- **Pellegrinaggio**: Viaggio a luogo sacro (riduce durata del 50%)
- **Esorcismo**: Rituale religioso (CD 15 Religione)

#### Magico
- **Rimuovi Maledizione**: Elimina menagramo automaticamente
- **Ristorare**: Cura effetti permanenti
- **Protezione dal Male**: Immunità temporanea

#### Sociale
- **Ritiro Monastico**: 1 settimana isolamento (-2 giorni durata)
- **Espiazione**: Buone azioni per ridurre effetti
- **Sacrificio**: Offerta a divinità (costo 100+ mo)

### Protezioni Preventive
- **Amuleto Fortunato**: +2 ai tiri per evitare menagramo
- **Benedizione**: Immunità 24 ore da menagramo
- **Giorno Fortunato**: Alcuni giorni calendario fortunati

## 🎮 Gestione Menagramo

### Comandi Disponibili
```
/menagramo apply <livello> <bersaglio>    # Applica menagramo
/menagramo remove                         # Rimuovi menagramo
/menagramo check                          # Stato menagramo attuale
/menagramo effects                        # Effetti attivi
/menagramo duration                       # Durata rimanente
/menagramo events                         # Eventi giornalieri
/menagramo protection                     # Protezioni attive
```

### Eventi Giornalieri
```
/menagramo daily                          # Eventi giornalieri menagramo
/menagramo misfortune                     # Eventi sfortuna attivi
/menagramo resolve                        # Risolvi evento sfortuna
```

## 📊 Integrazione Sistemi

### Infamia
- **Menagramo Estremo**: Infamia 90+ aumenta probabilità menagramo
- **Effetto Infamia**: Menagramo dura più a lungo con infamia alta
- **Cura Infamia**: Ridurre infamia aiuta a rimuovere menagramo

### Compagnia
- **Menagramo Condiviso**: Può estendersi a compagni
- **Cura Collettiva**: Rituali di compagnia per rimuovere menagramo
- **Supporto Sociale**: Compagni possono aiutare nella rimozione

### Malattie
- **Menagramo Debilitante**: Aumenta effetti malattie
- **Cura Magica**: Menagramo può interferire con cure magiche
- **Contagio Spirituale**: Menagramo può "contagiare" alleati

## 🏆 Varianti Speciali

### Menagramo Personalizzato
- **Menagramo del Giocatore**: Sfortuna specifica del giocatore
- **Menagramo del Personaggio**: Basato su background/storia
- **Menagramo Ambientale**: Sfortuna specifica della zona

### Eventi Speciali Menagramo
- **Venerdì 13**: +50% probabilità menagramo
- **Luna Piena**: Menagramo più potente
- **Luoghi Maledetti**: Menagramo automatico in certe zone

## 🎨 Personalizzazione Tema

### Icone Menagramo
- **Minore**: Teschio bianco con corona
- **Moderato**: Teschio giallo con corona
- **Maggiore**: Teschio rosso con corona

### Effetti Visivi
- **Aura Viola**: Bagliore viola intorno al personaggio
- **Simboli Sfortuna**: Icone sfortuna sulla scheda
- **Animazioni**: Effetti particellari per eventi sfortuna

## 📈 Analytics

### Statistiche Tracciate
- **Menagramo Contratti**: Frequenza per giocatore
- **Durata Media**: Tempo medio menagramo attivo
- **Metodi Rimozione**: Quale metodo usato più frequentemente
- **Eventi Trigger**: Eventi che causano più menagramo

### Report Disponibili
```javascript
// Report menagramo settimanale
game.brancalonia.analytics.generateMenagramoReport()

// Statistiche giocatore
game.brancalonia.analytics.getPlayerMenagramoStats(actor)
```

---

Il Sistema Menagramo aggiunge imprevedibilità e rischio al gioco, rendendo ogni sessione unica e pericolosa nel Regno di Taglia.

