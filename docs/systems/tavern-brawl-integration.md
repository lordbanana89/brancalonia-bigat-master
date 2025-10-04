# 🍺 Sistema Risse da Taverna - Integrazione Completa

## 📋 Riepilogo Integrazione

Il sistema **TavernBrawlSystem** è stato completamente potenziato integrando:
- ✅ **Eventi Atmosfera** da BaraondaSystem
- ✅ **20 Mosse Completamente Implementate**
- ✅ **Macro User-Friendly** con Dialog visuali
- ✅ **Trigger Automatico Eventi**
- ✅ **Background Attaccabrighe** integrato

### ⚠️ Modifiche Importanti

- **BaraondaSystem è stato DISABILITATO** e integrato in TavernBrawlSystem
- Le funzionalità sono identiche ma ora parte di un unico sistema coerente
- Le macro vecchie sono state sostituite con versioni moderne

---

## 🎮 MACRO USER-FRIENDLY

### Macro Principali Create

#### 1. **🍺 Gestione Risse** (Macro Principale)
- **Comando**: Clicca la macro dalla hotbar
- **Funzione**: Dialog intelligente che cambia in base al contesto
  - Senza rissa attiva → Inizia nuova rissa con opzioni
  - Con rissa attiva → Menu azioni rissa

**Caratteristiche**:
- ✅ Mostra tutti i partecipanti selezionati
- ✅ Opzione Pericoli Vaganti (on/off)
- ✅ Opzione Eventi Atmosfera (on/off)
- ✅ Regole rissa visualizzate

#### 2. **⚡ Eventi Rissa Rapidi**
- **Comando**: Clicca la macro
- **Funzione**: Trigger rapido di eventi
  - Evento Atmosfera (narrativo)
  - Pericolo Vagante (meccanico)
  - Entrambi contemporaneamente

#### 3. **📊 Stato Rissa**
- **Comando**: Clicca la macro
- **Funzione**: Tabella completa con:
  - Batoste di ogni partecipante
  - Slot mossa disponibili
  - Oggetti di scena in mano
  - Codice colore per stato (verde/giallo/rosso)

---

## 🥊 MOSSE IMPLEMENTATE

### Mosse Generiche (12 implementate)

| Mossa | Tipo | Effetto |
|-------|------|---------|
| **Buttafuori** | Reazione | Tiro For/Des, stordisce attaccante |
| **Schianto** | Azione | 1 batosta + prono + stordito (anche tu 1 batosta) |
| **Finta** | Azione | Fingi di essere svenuto, non bersagliabile |
| **Brodaglia in Faccia** | Azione Bonus | Tiro Des/Sag, acceca bersaglio |
| **Ghigliottina** | Azione | 1 batosta + prono |
| **Fracassateste** | Azione | 1 batosta a DUE bersagli |
| **Alla Pugna!** | Azione | Alleati hanno vantaggio prossimo attacco |
| **Sotto il Tavolo** | Azione | +5 CA + vantaggio TS Des |
| **Sgambetto** | Azione Bonus | Tiro Des/Int, rende prono |
| **Giù le Braghe** | Azione Bonus | Tiro Des/Car, trattiene bersaglio |
| **Pugnone in Testa** | Azione | 1 batosta + incapacitato |
| **Testata di Mattone** | Reazione | Tiro For/Cos, 1 batosta |

### Mosse Magiche (8 implementate)

| Mossa | Tipo | Effetto |
|-------|------|---------|
| **Protezione dal Menare** | Azione | Bersaglio: attacchi contro di lui hanno svantaggio |
| **Spruzzo Venefico** | Azione | Tiro Int/Sag/Car, 1 batosta + avvelenato |
| **Urla Dissennanti** | Azione | Bersaglio spaventato |
| **La Magna** | Azione | Bersaglio affascinato |
| **Sguardo Ghiacciante** | Azione | Bersaglio immune a batoste/condizioni 1 turno |
| **Pugno Incantato** | Azione | Tre tiri a tre bersagli, 1 batosta ciascuno |
| **Schiaffoveggenza** | Reazione | Attaccante ha svantaggio |
| **Sediata Spiriturale** | Azione Bonus | Trasforma oggetto comune in epico |

---

## 🎲 EVENTI ATMOSFERA (20 Eventi)

Eventi narrativi che aggiungono colore senza impatto meccanico:

1. "Una sedia vola attraverso la stanza!"
2. "Qualcuno rovescia un tavolo con fracasso!"
3. "Un boccale colpisce qualcuno in testa!"
4. "La musica si ferma improvvisamente!"
5. "Qualcuno grida 'ALLA CARICA!'"
6. "Un barile di birra esplode coprendovi di schiuma!"
7. "Le guardie arrivano alla porta!"
8. "Qualcuno inizia a cantare stonato!"
9. "Un cane inizia ad abbaiare furiosamente!"
10. "L'oste minaccia di chiamare la milizia!"
11. "Un avventore ubriaco cade dal soppalco!"
12. "Volano piatti e bicchieri in ogni direzione!"
13. "Qualcuno spegne le candele, buio parziale!"
14. "Il bardo cerca di calmare gli animi suonando!"
15. "Una finestra si sfonda per il caos!"
16. "L'oste grida 'NON I MIEI PIATTI!'"
17. "Un gatto salta sui tavoli seminando panico!"
18. "Qualcuno inciampa in una pozza di vino!"
19. "Si sente il fischio della milizia fuori!"
20. "Un avventore fugge dalla porta gridando!"

### Trigger Automatico

Setting disponibile: **"Eventi Atmosfera Automatici"**
- Default: ogni 2 turni
- Range: 0-10 (0 = disabilitato)
- Trigger automatico durante `combatTurn`

---

## ⚙️ SETTINGS CONFIGURABILI

### Nuovi Settings

1. **Eventi Atmosfera Automatici**
   - Default: 2 (ogni 2 turni)
   - Range: 0-10
   - 0 = disabilitato

### Settings Esistenti

- **Sistema Risse Attivo**: On/Off sistema completo
- **Pericoli Vaganti per Default**: Auto-attiva pericoli all'inizio
- **Macro Automatiche**: Crea macro al ready
- **Effetti Visivi**: Mostra effetti durante risse

---

## 🔧 GUIDA DM - USO PRATICO

### Come Iniziare una Rissa (Nuovo Metodo)

1. **Seleziona 2+ token** dei partecipanti
2. **Clicca macro "🍺 Gestione Risse"**
3. **Dialog si apre** con:
   - Lista partecipanti
   - Checkbox Pericoli Vaganti
   - Checkbox Eventi Atmosfera
   - Regole visualizzate
4. **Clicca "INIZIA RISSA!"**

✅ **FATTO!** La rissa parte automaticamente.

### Durante il Turno di un Personaggio

1. **Seleziona il token** del personaggio
2. **Clicca macro "🍺 Gestione Risse"**
3. **Dialog mostra**:
   - Stato attuale (batoste, slot, oggetti)
   - Pulsante **Saccagnata** (attacco base)
   - Pulsante **Mosse** (dialog con tutte le mosse)
   - Pulsante **Oggetti** (raccogli/usa)

### Scegliere una Mossa

1. **Clicca "Mosse"** nel dialog azioni
2. **Vedi lista visuale** di tutte le mosse:
   - Mosse generiche (sfondo beige)
   - Mosse magiche (sfondo viola)
   - Descrizione completa per ogni mossa
3. **Clicca una mossa** per eseguirla
4. **Sistema auto-verifica** se serve bersaglio

### Trigger Eventi Manuale

1. **Clicca macro "⚡ Eventi Rissa Rapidi"**
2. **Scegli**:
   - Evento Atmosfera (narrativo)
   - Pericolo Vagante (meccanico)
   - Entrambi!

### Vedere Stato Rissa

**Clicca macro "📊 Stato Rissa"** per tabella completa.

---

## 🐛 RISOLUZIONE PROBLEMI

### "Sistema Baraonda non disponibile"

✅ **Soluzione**: Baraonda è stato integrato in TavernBrawl. Usa le macro nuove.

### "Mosse non si eseguono"

✅ **Verifica**:
1. Hai slot mossa disponibili?
2. Serve un bersaglio selezionato?
3. La rissa è attiva?

### "Eventi non si triggerano automaticamente"

✅ **Verifica setting**: 
- Apri Settings → Brancalonia
- "Eventi Atmosfera Automatici" deve essere > 0

### "Macro non compaiono"

✅ **Soluzione**: Ricarica Foundry. Le macro si creano automaticamente al primo ready se sei GM.

---

## 📊 DIFFERENZE BARAONDA vs TAVERN-BRAWL

| Aspetto | Baraonda (OLD) | TavernBrawl (NEW) |
|---------|----------------|-------------------|
| **Sistema Danni** | Punti Ferita | Sistema Batoste (1-6) |
| **Comandi** | Chat `/baraonda` | Macro con Dialog |
| **Mosse** | ❌ Nessuna | ✅ 20 implementate |
| **Eventi** | 10 narrativi | 20 narrativi + 8 meccanici |
| **UI** | Solo chat | Dialog visuali |
| **Oggetti** | ❌ No | ✅ Comuni + Epici |
| **Regole Ufficiali** | ❌ Homebrew | ✅ Manuale pag. 51-57 |
| **Stato** | ⚠️ Deprecato | ✅ Attivo e completo |

---

## 🎯 BEST PRACTICES

### Per il DM

1. **Prepara la scena**: Posiziona i token prima
2. **Seleziona tutti insieme**: Click multiplo con Shift
3. **Usa macro principale**: Un solo click per iniziare
4. **Lascia eventi auto**: Si triggerano da soli ogni 2 turni
5. **Usa macro stato**: Per controllare chi sta per cadere

### Per i Giocatori

1. **Saccagnata è sempre disponibile**: Non consuma slot
2. **Slot mossa sono preziosi**: Usali strategicamente
3. **Oggetti di scena**: Raccoglili subito (azione bonus per comuni)
4. **Reazioni non consumano slot**: Buttafuori, Testata, Schiaffoveggenza
5. **6 Batoste = KO**: Stai sotto i 4 per sicurezza

---

## 🔄 MIGRAZIONE DA BARAONDA

Se stavi usando BaraondaSystem:

### Cosa fare:

1. ✅ **Usa TavernBrawlSystem** d'ora in poi
2. ✅ **Cancella vecchie macro** di Baraonda (opzionale)
3. ✅ **Usa le nuove macro** con dialog
4. ✅ **Eventi atmosfera** sono identici, solo migliore integrazione

### Cosa NON fare:

- ❌ Non cercare di usare `/baraonda` (disabilitato)
- ❌ Non usare entrambi i sistemi insieme
- ❌ Non preoccuparti dei vecchi setting baraonda (non vengono usati)

---

## 📞 SUPPORTO

### File Modificati

- `modules/tavern-brawl.js` - Sistema principale (arricchito)
- `modules/tavern-brawl-macros.js` - **NUOVO** - Macro user-friendly
- `modules/baraonda-system.js` - Disabilitato (deprecato)

### Se qualcosa non funziona:

1. Controlla console (F12) per errori
2. Verifica che TavernBrawlSystem sia inizializzato: `window.TavernBrawlSystem`
3. Verifica macro esistono: `game.macros` cerca "Gestione Risse"
4. Ricarica Foundry

---

## 🎉 CARATTERISTICHE CHIAVE

✅ **Sistema unificato** - Non più duplicazione
✅ **20 mosse funzionanti** - Non più stub!
✅ **UI moderna** - Dialog invece di chat
✅ **Eventi automatici** - Trigger ogni N turni
✅ **Oggetti di scena** - Comuni ed epici
✅ **Regole ufficiali** - Manuale pag. 51-57
✅ **Background Attaccabrighe** - +1 slot mossa
✅ **User-friendly** - 3 click e via!

---

**Versione**: 2.0
**Data**: 2025-10-03
**Autore**: Integrazione Brancalonia Team


