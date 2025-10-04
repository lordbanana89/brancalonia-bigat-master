#!/bin/bash
# Script per scaricare audio per uso privato
# ATTENZIONE: Esegui solo se hai autorizzazione legale

echo "🎬 Brancalonia - Download Audio Uso Privato"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANTE:"
echo "   Questo script è per USO PRIVATO PERSONALE"
echo "   Assicurati di avere diritto legale nella tua giurisdizione"
echo ""
read -p "Confermi di procedere per uso privato? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operazione annullata."
    exit 1
fi

# Variabili
SOUNDS_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR="/tmp/brancalonia_audio"

echo ""
echo "📁 Directory destinazione: $SOUNDS_DIR"
echo ""

# Crea directory temporanea
mkdir -p "$TEMP_DIR"

# ======================================
# OPZIONE 1: Download manuale guidato
# ======================================
echo "📋 ISTRUZIONI:"
echo ""
echo "1. Apri browser e vai su: https://www.budterence.tk/audiomms.php"
echo ""
echo "2. Scarica DUE file audio:"
echo "   - Un fischio/fanfara allegra (per CRITICO)"
echo "   - Un suono comico di fallimento (per FUMBLE)"
echo ""
echo "3. I file saranno in ~/Downloads"
echo ""
read -p "Premi INVIO quando hai scaricato i file..."

echo ""
echo "📂 File trovati in ~/Downloads:"
ls -lh ~/Downloads/*.mp3 2>/dev/null | tail -5

echo ""
echo "🎯 Seleziona file per CRITICO (20):"
read -p "Nome file (senza path): " CRITICAL_FILE

echo ""
echo "💀 Seleziona file per FUMBLE (1):"
read -p "Nome file (senza path): " FUMBLE_FILE

# Copia e rinomina
if [ -f ~/Downloads/"$CRITICAL_FILE" ]; then
    cp ~/Downloads/"$CRITICAL_FILE" "$SOUNDS_DIR/critical-hit.mp3"
    echo "✅ Copiato: critical-hit.mp3"
else
    echo "❌ File non trovato: $CRITICAL_FILE"
fi

if [ -f ~/Downloads/"$FUMBLE_FILE" ]; then
    cp ~/Downloads/"$FUMBLE_FILE" "$SOUNDS_DIR/fumble.mp3"
    echo "✅ Copiato: fumble.mp3"
else
    echo "❌ File non trovato: $FUMBLE_FILE"
fi

# ======================================
# Normalizza audio (se ffmpeg è installato)
# ======================================
if command -v ffmpeg &> /dev/null; then
    echo ""
    echo "🔊 Normalizziamo l'audio?"
    read -p "(Raccomandato, richiede ffmpeg) (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        if [ -f "$SOUNDS_DIR/critical-hit.mp3" ]; then
            echo "Normalizzando critical-hit.mp3..."
            ffmpeg -i "$SOUNDS_DIR/critical-hit.mp3" -af "loudnorm" -y "$TEMP_DIR/critical-hit-normalized.mp3" 2>/dev/null
            mv "$TEMP_DIR/critical-hit-normalized.mp3" "$SOUNDS_DIR/critical-hit.mp3"
            echo "✅ critical-hit.mp3 normalizzato"
        fi
        
        if [ -f "$SOUNDS_DIR/fumble.mp3" ]; then
            echo "Normalizzando fumble.mp3..."
            ffmpeg -i "$SOUNDS_DIR/fumble.mp3" -af "loudnorm" -y "$TEMP_DIR/fumble-normalized.mp3" 2>/dev/null
            mv "$TEMP_DIR/fumble-normalized.mp3" "$SOUNDS_DIR/fumble.mp3"
            echo "✅ fumble.mp3 normalizzato"
        fi
    fi
else
    echo ""
    echo "ℹ️  ffmpeg non trovato, salto normalizzazione"
    echo "   (Opzionale, installa con: brew install ffmpeg)"
fi

# Pulizia
rm -rf "$TEMP_DIR"

# ======================================
# Verifica finale
# ======================================
echo ""
echo "=========================================="
echo "📊 RIEPILOGO"
echo "=========================================="
echo ""

if [ -f "$SOUNDS_DIR/critical-hit.mp3" ]; then
    SIZE=$(du -h "$SOUNDS_DIR/critical-hit.mp3" | cut -f1)
    echo "✅ critical-hit.mp3 ($SIZE)"
else
    echo "❌ critical-hit.mp3 MANCANTE"
fi

if [ -f "$SOUNDS_DIR/fumble.mp3" ]; then
    SIZE=$(du -h "$SOUNDS_DIR/fumble.mp3" | cut -f1)
    echo "✅ fumble.mp3 ($SIZE)"
else
    echo "❌ fumble.mp3 MANCANTE"
fi

echo ""
echo "=========================================="
echo "🎉 SETUP COMPLETATO!"
echo "=========================================="
echo ""
echo "📋 Prossimi step:"
echo "1. Avvia Foundry VTT"
echo "2. Settings → Module Settings → Brancalonia"
echo "3. Abilita 'Suoni Critici/Fumble'"
echo "4. Tira /roll 1d20 per testare!"
echo ""
echo "🎲 Buona partita! 🍝"


