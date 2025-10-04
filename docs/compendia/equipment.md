# ⚔️ Equipaggiamento - Brancalonia

Questa sezione documenta l'equipaggiamento disponibile nel modulo Brancalonia, con focus su oggetti scadenti e armi primitive tipiche del Regno di Taglia.

## 🗡️ Armi Scadenti

### Armi Bianche Scadenti

#### Spade
- **Spada Scadente**: 1d8 versatile (1d10), 15 mo, lama arrugginita
- **Spada Corta Scadente**: 1d6, 10 mo, bilanciamento scarso
- **Spada Lunga Scadente**: 1d8/1d10, 20 mo, impugnatura scivolosa
- **Stocco Scadente**: 1d8, 25 mo, lama flessibile

#### Mazze e Martelli
- **Mazza Scadente**: 1d6, 5 mo, peso eccessivo
- **Martello da Guerra Scadente**: 1d8/1d10, 15 mo, testa allentata
- **Martello Leggero Scadente**: 1d4, 2 mo, manico scheggiato

#### Asce
- **Ascia Scadente**: 1d8/1d10, 10 mo, lama smussata
- **Ascia a Due Mani Scadente**: 1d12, 30 mo, bilanciamento scarso
- **Ascia da Lancio Scadente**: 1d6, 5 mo, traiettoria imprevedibile

#### Armi da Asta
- **Lancia Scadente**: 1d6/1d8, 5 mo, punta spuntata
- **Alabarda Scadente**: 1d10, 20 mo, peso eccessivo
- **Picca Scadente**: 1d10, 5 mo, instabile

### Armi da Fuoco Primitive

#### Pistole
- **Pistola Scadente**: 1d10 perforante, 100 mo, rischio esplosione
- **Pistola a Pietra**: 1d10 perforante, 150 mo, ricarica lenta
- **Pistola ad Accensione**: 1d10 perforante, 200 mo, affidabile

#### Moschetti
- **Moschetto Arrugginito**: 1d12 perforante, 200 mo, precisione scarsa
- **Archibugio Pesante**: 2d6 perforante, 300 mo, ricarica 3 round
- **Schioppetto**: 1d8 perforante, 80 mo, corto raggio

### Armi da Tiro
- **Arco Scadente**: 1d8 perforante, 15 mo, corda sfilacciata
- **Balestra Scadente**: 1d8 perforante, 30 mo, meccanismo inceppato
- **Fionda Scadente**: 1d4 contundente, 1 mo, elastico debole

## 🛡️ Armature Scadenti

### Armature Leggere
- **Armatura di Cuoio Scadente**: CA 11 + Des, 20 mo, cuciture deboli
- **Armatura di Cuoio Borchiato Scadente**: CA 12 + Des, 40 mo, borchie arrugginite
- **Giacca di Cuoio Scadente**: CA 11 + Des, 10 mo, materiale sottile

### Armature Medie
- **Gambeson Scadente**: CA 12 + Des (max 2), 20 mo, imbottitura irregolare
- **Mezza Armatura Scadente**: CA 13 + Des (max 2), 200 mo, giunti rigidi
- **Armatura a Scaglie Scadente**: CA 14 + Des (max 2), 30 mo, scaglie staccate

### Armature Pesanti
- **Armatura a Piastre Scadente**: CA 18, 600 mo, mobilità ridotta
- **Corazza Scadente**: CA 14 + Des (max 2), 100 mo, protezione irregolare

### Scudi
- **Scudo Scadente**: +2 CA, 5 mo, instabile
- **Scudo Grande Scadente**: +3 CA, 15 mo, pesante

## 💰 Oggetti Comuni

### Abbigliamento
- **Abiti Comuni Scadenti**: 5 mo, stoffa ruvida
- **Abiti da Viaggio Scadenti**: 10 mo, protezione scarsa
- **Abiti Eleganti Scadenti**: 15 mo, aspetto trasandato
- **Mantello Scadente**: 3 mo, poca protezione

### Strumenti e Kit
- **Zaino Scadente**: 1 mo, capacità ridotta
- **Sacco a Pelo Scadente**: 5 mo, poco isolamento
- **Tenda Scadente**: 10 mo, protezione scarsa
- **Corda Scadente**: 1 mo, 50 piedi, rischio rottura

### Illuminazione
- **Candela Scadente**: 1 mr, luce fioca, dura 1 ora
- **Lampada Scadente**: 5 mo, olio necessario, luce irregolare
- **Torcia Scadente**: 1 mr, luce intensa, dura 30 minuti

## 🧪 Cimeli e Oggetti Speciali

### Cimeli Brancalonia
- **Anello del Pescatore**: Protezione acquatica
- **Medaglione di Santa Lucia**: Visione migliorata
- **Corno di Orlando**: Suono potente per intimorire
- **Spada di Durendal**: Lama leggendaria

### Oggetti Contraffatti
- **Monete False**: Sembrano autentiche, ma valore scarso
- **Documenti Falsi**: Passaporti e permessi contraffatti
- **Gioielli Finti**: Pietre preziose artificiali
- **Mappe Tesoro False**: Mappe ingannevoli

## ⚙️ Sistema Qualità Scadente

### Meccanica Rottura
```javascript
// Sistema rottura oggetti scadenti
const durability = {
  scadente: '1d4 usi',
  normale: '2d6 usi',
  buona: '3d8 usi',
  eccellente: 'permanente'
};

// Controllo rottura dopo uso
if (oggetto.quality === 'scadente') {
  const durabilityRoll = new Roll('1d4').evaluate({ async: false });
  if (durabilityRoll.total <= 1) {
    oggetto.broken = true;
    // Notifica rottura
  }
}
```

### Riparazione
- **Costo**: 10-50% valore originale
- **Tempo**: 1 ora per oggetto semplice
- **CD**: Artigianato 12-18
- **Materiali**: Necessari per riparazione

## 🎲 Eventi Casuali Equipaggiamento

### Eventi Durante Uso
- **Rottura Improvvisa**: Oggetto si rompe durante uso critico
- **Malfunzionamento**: Arma inceppata o armatura lenta
- **Rottura Parziale**: Funziona ancora ma con penalità
- **Riparazione d'Emergenza**: Riparazione temporanea sul campo

### Eventi di Ritrovamento
- **Arma Abbandonata**: Arma lasciata da briganti
- **Armatura Scadente**: Equipaggiamento di bassa qualità
- **Oggetto Maledetto**: Oggetto con effetti soprannaturali
- **Tesoro Nascosto**: Ritrovamento fortuito

## 📊 Integrazione Sistemi

### Sistema Infamia
- **Equipaggiamento Illegale**: Alcuni oggetti aumentano infamia
- **Armi Contrabbandate**: Armi illegali nel territorio
- **Oggetti Rubati**: Riconoscibili dalle autorità

### Sistema Compagnia
- **Equipaggiamento Condiviso**: Armi e armature per compagnia
- **Specializzazioni**: Equipaggiamento per ruoli specifici
- **Manutenzione Collettiva**: Riparazioni di gruppo

### Sistema Haven
- **Armeria**: Stanza per manutenzione equipaggiamento
- **Officina**: Produzione armi e armature
- **Magazzino**: Deposito sicuro equipaggiamento

## 🏆 Equipaggiamento Speciale

### Armi Leggendarie
- **Spada di Orlando**: +3 spada intelligente
- **Corno di Agramante**: Suono che demoralizza nemici
- **Armatura di Astolfo**: Armatura lunare
- **Lancia di Bradamante**: +2, effetti magici

### Oggetti Artefatto
- **Libro di Malagigi**: Tomo di magia
- **Anello di Angelica**: Protezione magica
- **Cavallo Baiardo**: Destriero intelligente
- **Scudo di Atlante**: Scudo incantato

## 💰 Economia Equipaggiamento

### Prezzi Regionali
- **Città**: Prezzi normali, qualità variabile
- **Campagna**: Prezzi alti, qualità scarsa
- **Frontiera**: Prezzi bassi, qualità molto scarsa
- **Mercati Neri**: Prezzi alti, qualità illegale

### Mercanti Specializzati
- **Fabbri**: Armi e armature
- **Sarti**: Abbigliamento e armature leggere
- **Alchimisti**: Oggetti chimici e misture
- **Mercanti Itineranti**: Merci varie

## 🎨 Personalizzazione

### Modifiche Equipaggiamento
- **Incisioni**: Personalizzazione estetica
- **Miglioramenti**: Potenziamenti funzionali
- **Maledizioni**: Effetti negativi intenzionali
- **Benedizioni**: Effetti positivi religiosi

### Varianti Culturali
- **Stile Levantini**: Design orientale
- **Stile Bracaloni**: Rustico e funzionale
- **Stile Svanzici**: Nomade e pratico

---

L'equipaggiamento di Brancalonia riflette l'ambientazione rinascimentale italiana, con oggetti scadenti che si rompono, armi primitive e cimeli leggendari che aggiungono sapore epico alle avventure.

