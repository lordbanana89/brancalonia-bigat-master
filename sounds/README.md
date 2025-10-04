# 🎵 Suoni Brancalonia - Critici e Fumble

Questa cartella contiene i file audio per le notifiche di critici e fumble nei tiri di dado.

---

## 📁 File Richiesti

### 1. `critical-hit.mp3`
**Trigger**: Quando tiri un **20 naturale** su un d20  
**Suggerimenti audio**:
- Fanfara trionfale
- Campane di vittoria
- Applausi e acclamazioni
- "Gloria!" epico
- Suono di spada che colpisce con riverbero

**Durata consigliata**: 2-3 secondi

---

### 2. `fumble.mp3`
**Trigger**: Quando tiri un **1 naturale** su un d20  
**Suggerimenti audio**:
- Trombone "wah wah wah" (sad trombone)
- Crash comico
- "Oh no!" drammatico
- Piatto che si rompe
- Stonatura orchestrale

**Durata consigliata**: 1-2 secondi

---

## 🔊 Caratteristiche Tecniche

### Formato
- **Formato**: MP3 (raccomandato) o OGG
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Canali**: Stereo o Mono

### Volume
- **Normalizzazione**: -3 dB peak
- **Volume nel codice**: 0.5 (50%)
- Regolabile dall'utente via Foundry VTT

---

## 🌐 Dove Trovare Suoni Gratuiti

### Siti Consigliati (CC0 / Public Domain)

#### 1. **Freesound.org** 🏆
- URL: https://freesound.org
- Licenze: CC0, CC-BY, CC-BY-NC
- Qualità: Alta
- Ricerca suggerita:
  - "fanfare victory"
  - "sad trombone"
  - "critical hit"
  - "failure sound"

#### 2. **Pixabay Sound Effects**
- URL: https://pixabay.com/sound-effects/
- Licenza: Pixabay License (uso commerciale OK)
- Qualità: Alta
- Ricerca suggerita:
  - "triumph"
  - "fail"
  - "comedy"

#### 3. **Zapsplat**
- URL: https://www.zapsplat.com
- Licenza: Free con attribuzione
- Qualità: Professionale
- Ricerca suggerita:
  - "game success"
  - "game fail"

#### 4. **Mixkit Sound Effects**
- URL: https://mixkit.co/free-sound-effects/
- Licenza: Mixkit License (libero uso)
- Qualità: Alta
- Ricerca suggerita:
  - "win"
  - "lose"

#### 5. **BBC Sound Effects**
- URL: https://sound-effects.bbcrewind.co.uk
- Licenza: RemArc License (uso personale/educativo)
- Qualità: Archivio professionale BBC

---

## 🎨 Suggerimenti Tematici per Brancalonia

### Per Critico (20) - Stile Rinascimentale Italiano
- Fanfara da corte rinascimentale
- Campane di chiesa
- "Evviva!" da folla italiana
- Suono di calice di vino brindisi
- Arpa trionfale

### Per Fumble (1) - Stile Commedia Italiana
- Mandolino stonato
- Piatto di ceramica che si rompe
- "Mamma mia!" drammatico
- Fischio discendente cartoon
- Trombone "wah wah wah"

---

## 🛠️ Come Aggiungere i Suoni

### 1. Download
Scarica i file audio da uno dei siti sopra

### 2. Conversione (se necessario)
Se il file non è MP3:
```bash
# Usando FFmpeg
ffmpeg -i input.wav -b:a 128k critical-hit.mp3
```

### 3. Posizionamento
Salva i file in questa cartella:
```
brancalonia-bigat/
└── sounds/
    ├── critical-hit.mp3
    └── fumble.mp3
```

### 4. Abilitazione
1. Avvia Foundry VTT
2. Settings → Module Settings → Brancalonia
3. Abilita "Suoni Critici/Fumble"
4. Testa con `/roll 1d20`

---

## 🎯 Testing

### Test in Foundry
```javascript
// Console F12
AudioHelper.play({
  src: 'modules/brancalonia-bigat/sounds/critical-hit.mp3',
  volume: 0.5,
  autoplay: true,
  loop: false
}, false);
```

### Test Critico
```javascript
/roll 1d20
// Se risulta 20, deve suonare critical-hit.mp3
```

### Test Fumble
```javascript
/roll 1d20
// Se risulta 1, deve suonare fumble.mp3
```

---

## 📋 Checklist

- [ ] Scaricato `critical-hit.mp3` (o equivalente)
- [ ] Scaricato `fumble.mp3` (o equivalente)
- [ ] File posizionati in `sounds/`
- [ ] Formato corretto (MP3 o OGG)
- [ ] Durata appropriata (1-3 secondi)
- [ ] Volume normalizzato
- [ ] Testato in Foundry VTT
- [ ] Abilitato setting "Suoni Critici/Fumble"

---

## 🎵 Esempi Specifici Consigliati

### Critical Hit (20)

#### Opzione A - Epico 🏆
**Nome**: "Epic Victory Fanfare"  
**Fonte**: Pixabay  
**Link**: Cerca "epic fanfare short"  
**Durata**: 2s  

#### Opzione B - Medievale ⚔️
**Nome**: "Medieval Trumpet Fanfare"  
**Fonte**: Freesound  
**Link**: Cerca "medieval trumpet victory"  
**Durata**: 3s  

#### Opzione C - Classico 🎺
**Nome**: "Ta-Da!"  
**Fonte**: Zapsplat  
**Link**: Cerca "ta da sound effect"  
**Durata**: 1s  

---

### Fumble (1)

#### Opzione A - Commedia 🤡
**Nome**: "Sad Trombone"  
**Fonte**: Freesound  
**Link**: Cerca "sad trombone wah wah"  
**Durata**: 1s  

#### Opzione B - Cartoon 💥
**Nome**: "Cartoon Fail"  
**Fonte**: Pixabay  
**Link**: Cerca "cartoon fail"  
**Durata**: 2s  

#### Opzione C - Crash 🍽️
**Nome**: "Plate Crash"  
**Fonte**: Mixkit  
**Link**: Cerca "plate break"  
**Durata**: 1s  

---

## ⚠️ Note Legali

### Licenze
- **CC0**: Dominio pubblico, uso libero
- **CC-BY**: Richiede attribuzione
- **CC-BY-NC**: Solo uso non commerciale
- **Pixabay/Mixkit**: Licenze specifiche, leggere termini

### Attribuzione
Se usi file CC-BY, aggiungi crediti in:
```
/Users/erik/Desktop/brancalonia-bigat-master/CREDITS.md
```

Esempio:
```
## Suoni

- critical-hit.mp3 - Autore: NomeAutore (Freesound)
  Licenza: CC-BY 4.0
  
- fumble.mp3 - Autore: AltroAutore (Pixabay)
  Licenza: Pixabay License
```

---

## 🎉 Risultato Finale

Con i suoni configurati:
- ✅ Tiro 20 → Fanfara + Notifica "⚔️ Colpo Critico!"
- ✅ Tiro 1 → Trombone triste + Notifica "💀 Fallimento Critico!"
- ✅ Altri tiri → Solo animazione dadi DSN
- ✅ Configurabile on/off nei settings

**Buon gioco! 🎲🍷**

---

**Ultimo aggiornamento**: 2025-10-03  
**Versione**: 1.0


