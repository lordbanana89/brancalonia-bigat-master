# 🎬 Guida Suoni - Uso Privato
## Stile Autentico Bud Spencer & Terence Hill

---

## ⚠️ DISCLAIMER

**Questa guida è SOLO per uso privato personale.**

I file audio originali dai film sono protetti da copyright. Questa guida è fornita **esclusivamente** per:
- ✅ Uso personale nella tua partita privata
- ✅ Non distribuire il modulo con questi audio
- ✅ Non caricare su repository pubblici

**Se vuoi distribuire il modulo pubblicamente**, usa i file royalty-free della guida `GUIDA-SUONI-COMICI.md`.

---

## 🎯 Opzione A: Suoni Autentici (Uso Privato)

### Fonte: budterence.tk

**URL**: https://www.budterence.tk/audiomms.php

Questo sito fan-made contiene audio estratti dai film originali.

---

### 🎺 Per CRITICO (20) - Suoni Suggeriti

#### 1. "Dune Buggy" (Fischio)
**Film**: "Altrimenti ci arrabbiamo!"
**Descrizione**: Fischio iconico dalla canzone
**Durata**: ~2s
**Come ottenerlo**:
1. Vai su budterence.tk
2. Cerca "Dune Buggy"
3. Scarica il file
4. Taglia solo il fischio iniziale
5. Rinomina in `critical-hit.mp3`

#### 2. "Banana Joe" (Tromba Allegra)
**Film**: "Banana Joe"
**Descrizione**: Fanfara allegra
**Durata**: ~3s
**Come ottenerlo**:
1. Cerca colonna sonora "Banana Joe"
2. Estrai sezione con tromba
3. Rinomina in `critical-hit.mp3`

#### 3. Effetto "Pugno Comico"
**Film**: Vari
**Descrizione**: Il classico suono esagerato dei pugni
**Durata**: ~1s
**Come ottenerlo**:
- Su YouTube: "Bud Spencer punch sound effect"
- Usa un tool come youtube-dl (solo per uso personale!)
- Estrai solo l'audio del pugno

---

### 💀 Per FUMBLE (1) - Suoni Suggeriti

#### 1. ⭐ "Suono Scivolata" (IL MIGLIORE)
**Film**: Scene di cadute comiche
**Descrizione**: Il classico suono quando qualcuno scivola
**Durata**: ~1-2s
**Perfetto per**: Fumble comico

#### 2. "Crash con Piatti"
**Film**: Scene di risse da taverna
**Descrizione**: Piatti che si rompono + crash
**Durata**: ~1s

#### 3. "Trombone Triste Orchestrale"
**Film**: Momenti comici di fallimento
**Descrizione**: Versione orchestrale del "wah wah"
**Durata**: ~2s

---

## 🎵 Opzione B: Colonne Sonore Oliver Onions

### Chi Sono
I fratelli **Guido e Maurizio De Angelis** (Oliver Onions) hanno composto TUTTE le colonne sonore iconiche.

### Album Consigliati (Uso Privato)

#### 1. "Bud Spencer & Terence Hill Greatest Hits"
**Tracce utili**:
- "Dune Buggy" (fischio iconico)
- "Flying Through the Air"
- "Sheriff"

**Dove trovarlo**:
- Spotify (per ascoltare)
- CD fisico (se possiedi)
- Streaming legale

---

#### 2. "Lo chiamavano Trinità..." (Colonna Sonora)
**Tracce utili**:
- Tema principale (armonica)
- "Salve fratelli"

---

#### 3. "Altrimenti ci arrabbiamo!" (Colonna Sonora)
**Tracce utili**:
- "Dune Buggy" (completa)
- Temi secondari

---

## 🛠️ Come Estrarre e Preparare

### Tool Necessari

#### 1. Audacity (Gratis)
**Download**: https://www.audacityteam.org
**Uso**:
1. Importa file audio
2. Seleziona la parte che vuoi (1-3 secondi)
3. File → Export → MP3
4. Normalizza audio a -3dB

#### 2. FFmpeg (Riga di comando)
**Download**: https://ffmpeg.org
**Uso**:
```bash
# Taglia da secondo 10 a 12
ffmpeg -i input.mp3 -ss 10 -t 2 -c copy output.mp3

# Converti in MP3 con normalizzazione
ffmpeg -i input.wav -af "loudnorm" -b:a 128k output.mp3
```

---

## 📋 Guida Passo-Passo

### CRITICO (20) - "Dune Buggy Whistle"

#### Step 1: Ottieni il File
**Opzione A - Da CD**:
```bash
# Se hai il CD originale
cd /Volumes/CD_BRANCALONIA
cp track_03.wav ~/Desktop/dune-buggy.wav
```

**Opzione B - Da Streaming** (solo se abbonato):
- Spotify/Apple Music hanno l'album
- NON possiamo registrare da streaming (violazione TOS)
- Usa solo per riferimento

**Opzione C - Da budterence.tk**:
1. Vai su https://www.budterence.tk/audiomms.php
2. Trova audio con fischio iconico
3. Download per uso personale

#### Step 2: Estrai Fischio
```bash
# Apri con Audacity
audacity dune-buggy.wav

# Oppure con FFmpeg
ffmpeg -i dune-buggy.mp3 -ss 5.2 -t 2 -c copy whistle.mp3
```

#### Step 3: Normalizza
In Audacity:
1. Select All (Ctrl+A)
2. Effect → Normalize
3. Peak amplitude: -3.0 dB
4. Export → MP3

#### Step 4: Salva
```bash
mv whistle.mp3 critical-hit.mp3
cp critical-hit.mp3 ~/Desktop/brancalonia-bigat-master/sounds/
```

---

### FUMBLE (1) - "Suono Scivolata"

#### Step 1: Trova su YouTube (Uso Privato)
**Cerca**: "Bud Spencer fall sound effect"

**Tool per download** (uso personale):
```bash
# youtube-dl (se legale nella tua giurisdizione)
youtube-dl --extract-audio --audio-format mp3 [URL]
```

⚠️ **ATTENZIONE**: Verifica le leggi locali sul "fair use" personale.

#### Step 2: Estrai Solo il Suono
Con Audacity:
1. Importa file scaricato
2. Trova il momento della caduta/scivolata
3. Seleziona solo 1-2 secondi
4. Rimuovi rumori di fondo (Effect → Noise Reduction)

#### Step 3: Aggiungi Fade
```bash
# Con FFmpeg, aggiungi fade in/out
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=0.1,afade=t=out:st=1.9:d=0.1" output.mp3
```

#### Step 4: Salva
```bash
mv output.mp3 fumble.mp3
cp fumble.mp3 ~/Desktop/brancalonia-bigat-master/sounds/
```

---

## 🎯 Alternativa Quick & Dirty

### Registra dalla TV/Streaming

Se stai guardando un film su servizio di streaming personale:

#### Setup
1. **Audacity** in modalità registrazione
2. Output audio → Loopback
3. Riproduci scena con suono desiderato
4. Registra
5. Salva porzione

⚠️ Solo per uso personale nella tua copia!

---

## 📊 File Consigliati Finali

### Setup Ottimale per Brancalonia

```
sounds/
├── critical-hit.mp3  → Fischio "Dune Buggy" (2s)
└── fumble.mp3        → Suono scivolata comica (1.5s)
```

### Alternative

#### Setup A - Orchestrale
```
critical-hit.mp3 → Fanfara "Banana Joe"
fumble.mp3       → Trombone triste Oliver Onions
```

#### Setup B - Rissa
```
critical-hit.mp3 → Pugno comico esagerato
fumble.mp3       → Crash piatti + caduta
```

#### Setup C - Western
```
critical-hit.mp3 → Armonica "Trinità"
fumble.mp3       → Caduta da cavallo buffa
```

---

## ⚖️ Note Legali Uso Privato

### In Italia (e UE)
**Copia Privata** - Art. 71-sexies Legge sul Diritto d'Autore:
- ✅ Puoi fare copie per uso personale
- ✅ Non puoi distribuire
- ✅ Non puoi vendere
- ✅ Solo per te e il tuo gruppo di gioco

### Cosa Puoi Fare
✅ Scaricare audio per la tua partita  
✅ Condividere con il tuo gruppo di gioco privato  
✅ Usare in streaming privato (non YouTube pubblico)  

### Cosa NON Puoi Fare
❌ Distribuire il modulo con questi audio  
❌ Caricare su GitHub/GitLab pubblici  
❌ Vendere o monetizzare  
❌ Stream pubblici su Twitch/YouTube  

---

## 🎬 Testing Finale

### In Foundry VTT
1. Copia file in `sounds/`
2. Abilita "Suoni Critici/Fumble" nei settings
3. Tira `/roll 1d20`
4. Se esce 20 → Fischio "Dune Buggy"! 🎺
5. Se esce 1 → Scivolata comica! 💀

### Test Console
```javascript
// Test critico
AudioHelper.play({
  src: 'modules/brancalonia-bigat/sounds/critical-hit.mp3',
  volume: 0.5
}, false);

// Test fumble
AudioHelper.play({
  src: 'modules/brancalonia-bigat/sounds/fumble.mp3',
  volume: 0.5
}, false);
```

---

## 🎉 Risultato Finale

Con suoni autentici:
- ✅ Atmosfera **AUTENTICA** Bud & Terence
- ✅ Fischio iconico "Dune Buggy"
- ✅ Stile commedia italiana originale
- ✅ Massima immersione per il gruppo

**Perfetto per la tua tavola privata! 🍝🎲**

---

## 📝 Credits (Uso Privato)

Aggiungi in `CREDITS.md`:

```
## Suoni (Uso Privato - Non Distribuibile)

Audio tratti da:
- Colonne sonore film Bud Spencer & Terence Hill
- Compositori: Guido & Maurizio De Angelis (Oliver Onions)
- © Acheron S.r.l. e relativi detentori diritti
- Uso: Solo privato personale, non distribuibile

Questo modulo NON include questi file.
Gli utenti devono procurarseli legalmente per uso personale.
```

---

**⚠️ RICORDA**: Questa guida è **SOLO per uso privato**.  
Se vuoi distribuire il modulo, usa i suoni royalty-free!

**Ultimo aggiornamento**: 2025-10-03  
**Versione**: Uso Privato  
**Status**: Per la tua tavola personale ❤️


