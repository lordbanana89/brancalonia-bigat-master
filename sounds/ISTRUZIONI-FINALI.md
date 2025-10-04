# 🎯 Istruzioni Finali - Setup Audio

## Ho preparato tutto per te!

---

## 📁 File Creati

```
sounds/
├── README.md                    (guida generale)
├── GUIDA-SUONI-COMICI.md       (opzione royalty-free)
├── GUIDA-USO-PRIVATO.md        (opzione autentica)
├── QUICK-START-PRIVATO.md      (guida veloce)
├── download-audio.sh           (script automatico)
└── ISTRUZIONI-FINALI.md        (questo file)
```

---

## ⚡ Opzione 1: Script Automatico (RACCOMANDATO)

### Esegui lo script:
```bash
cd ~/Desktop/brancalonia-bigat-master/sounds
./download-audio.sh
```

Lo script ti guiderà passo-passo:
1. Scaricherai i file da budterence.tk
2. Li rinominerà automaticamente
3. Li normalizzerà (se hai ffmpeg)
4. ✅ FATTO!

**Tempo**: 5 minuti

---

## ⚡ Opzione 2: Manuale Super Veloce

### Passo 1: Scarica
1. Vai su: https://www.budterence.tk/audiomms.php
2. Scarica 2 file audio a tua scelta:
   - Uno allegro/vittorioso → per CRITICO
   - Uno comico/fallimento → per FUMBLE

### Passo 2: Rinomina e Copia
```bash
cd ~/Downloads

# Rinomina i tuoi file
mv tuo_file_critico.mp3 critical-hit.mp3
mv tuo_file_fumble.mp3 fumble.mp3

# Copia nella cartella sounds
cp critical-hit.mp3 ~/Desktop/brancalonia-bigat-master/sounds/
cp fumble.mp3 ~/Desktop/brancalonia-bigat-master/sounds/
```

### Passo 3: Test
```bash
# Verifica che ci siano
ls -lh ~/Desktop/brancalonia-bigat-master/sounds/*.mp3
```

**Tempo**: 3 minuti

---

## ⚡ Opzione 3: Suoni Specifici Consigliati

### Su budterence.tk cerca:

**Per CRITICO (20)**:
- "Dune Buggy" (il fischio)
- Qualsiasi fanfara allegra
- Suono di pugno esagerato

**Per FUMBLE (1)**:
- Suono di caduta comica
- "Wah wah wah" triste
- Crash di piatti

---

## 🎨 Suggerimenti Creativi

### Combo "Classica"
```
critical-hit.mp3 = Fischio "Dune Buggy"
fumble.mp3       = Caduta comica
```

### Combo "Rissa"
```
critical-hit.mp3 = Pugno esagerato
fumble.mp3       = Piatti che si rompono
```

### Combo "Western"
```
critical-hit.mp3 = Armonica allegra
fumble.mp3       = Trombone triste
```

---

## 🔧 Tool Utili (Opzionali)

### Se vuoi tagliare/modificare audio:

#### Audacity (GUI - Facile)
```bash
# Download da:
https://www.audacityteam.org

# Uso:
1. File → Open
2. Seleziona porzione che vuoi
3. File → Export → MP3
```

#### FFmpeg (Command Line - Veloce)
```bash
# Installa (se non ce l'hai)
brew install ffmpeg

# Taglia audio (esempio: da secondo 5 a 7)
ffmpeg -i input.mp3 -ss 5 -t 2 output.mp3

# Normalizza volume
ffmpeg -i input.mp3 -af "loudnorm" output.mp3
```

---

## ✅ Checklist Finale

Dopo aver copiato i file:

```bash
# Verifica presenza
ls -lh ~/Desktop/brancalonia-bigat-master/sounds/

# Dovresti vedere:
# critical-hit.mp3
# fumble.mp3
```

- [ ] File `critical-hit.mp3` presente
- [ ] File `fumble.mp3` presente
- [ ] File tra 10KB e 500KB (dimensione ragionevole)
- [ ] Durata 1-3 secondi ciascuno

---

## 🎮 Test in Foundry VTT

### 1. Avvia Foundry
```bash
# Se usi nvm/node locale
cd ~/foundrydata
node resources/app/main.js
```

### 2. Abilita Suoni
1. Settings → Module Settings
2. Cerca "Brancalonia"
3. Trova "Suoni Critici/Fumble"
4. ✅ Abilita

### 3. Testa!
```javascript
// In chat
/roll 1d20

// Se esce 20 → Suono CRITICO! 🎺
// Se esce 1  → Suono FUMBLE! 💀
```

### 4. Test Manuale Console
```javascript
// F12 → Console
AudioHelper.play({
  src: 'modules/brancalonia-bigat/sounds/critical-hit.mp3',
  volume: 0.5
}, false);
```

---

## 🎉 Risultato Finale

```
Giocatore tira 1d20...

Risultato: 20 naturale
🎺 [SUONO DUNE BUGGY]
💬 "⚔️ Colpo Critico! Magnifico!"

Risultato: 1 naturale  
💀 [SUONO CADUTA COMICA]
💬 "💀 Fallimento Critico! Maledizione!"
```

**Atmosfera autentica Bud Spencer & Terence Hill! 🍝🎬**

---

## ❓ Problemi Comuni

### File non si sentono
```javascript
// Verifica volume in Foundry
game.settings.get('core', 'globalInterfaceVolume')

// Prova a cambiare
game.settings.set('core', 'globalInterfaceVolume', 0.8)
```

### File troppo forte/debole
```bash
# Normalizza con ffmpeg
cd sounds/
ffmpeg -i critical-hit.mp3 -af "volume=0.5" critical-hit-fixed.mp3
mv critical-hit-fixed.mp3 critical-hit.mp3
```

### File troppo lungo
```bash
# Taglia (primi 2 secondi)
ffmpeg -i input.mp3 -t 2 output.mp3
```

---

## 📞 Supporto

Se hai problemi:
1. Controlla che i file siano in `sounds/`
2. Verifica che siano .mp3 validi
3. Controlla dimensione (10KB-500KB)
4. Prova con file più piccoli

---

## 🎊 Buona Partita!

Ora hai tutto per un'esperienza di gioco **autentica** alla Bud Spencer & Terence Hill!

**Che la fortuna sia con te! 🎲🍷**

---

**Ultimo aggiornamento**: 2025-10-03  
**Setup**: Completato e pronto all'uso ✅


