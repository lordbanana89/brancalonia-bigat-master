# 💬 Comandi Chat - Brancalonia

Questa sezione documenta tutti i comandi chat disponibili nel modulo Brancalonia.

## 🎭 Sistema Infamia e Reputazione

### Gestione Infamia
```
/infamia add <valore>           # Aggiunge infamia al personaggio
/infamia remove <valore>        # Rimuove infamia dal personaggio
/infamia set <valore>           # Imposta infamia a un valore specifico
/infamia check                  # Mostra infamia attuale del personaggio
/infamia status                 # Mostra stato infamia dettagliato
```

**Esempi:**
```
/infamia add 5                  # +5 infamia per furto minore
/infamia remove 2               # -2 infamia per buona azione
/infamia set 50                 # Imposta infamia a 50 (Ricercato)
/infamia check                  # Mostra: "Infamia attuale: 35"
```

### Reputazione Positiva
```
/reputazione add <tipo> <valore>    # Aggiunge reputazione positiva
/reputazione check <tipo>           # Mostra reputazione per categoria
/reputazione status                 # Mostra tutte le reputazioni
```

**Tipi disponibili:** `onore`, `fama`, `devozione`, `lealta`

**Esempi:**
```
/reputazione add onore 10       # +10 onore per azione eroica
/reputazione check fama         # Mostra reputazione fama attuale
```

## 🏠 Sistema Compagnia

### Gestione Compagnia
```
/compagnia create <nome>        # Crea una nuova compagnia
/compagnia join <nome>          # Unisciti a una compagnia esistente
/compagnia leave                # Abbandona la compagnia attuale
/compagnia status               # Mostra stato della compagnia
/compagnia members              # Lista tutti i membri
/compagnia treasury             # Mostra tesoro della compagnia
/compagnia reputation           # Mostra reputazione compagnia
```

**Esempi:**
```
/compagnia create "I Lupi di Taglia"
/compagnia status               # Mostra: "Compagnia attiva con 3 membri"
/compagnia treasury             # Mostra oro e oggetti comuni
```

## 🏰 Sistema Haven (Rifugi)

### Gestione Rifugio
```
/haven create <nome> <tipo>     # Crea un nuovo rifugio
/haven upgrade <stanza>         # Migliora una stanza esistente
/haven status                   # Mostra stato del rifugio
/haven rooms                    # Lista tutte le stanze
/haven events                   # Eventi casuali del rifugio
/haven visitors                 # Visitatori attuali
/haven security                 # Livello sicurezza rifugio
```

**Tipi di rifugio disponibili:**
- `tavern` - Osteria o locanda
- `warehouse` - Magazzino abbandonato
- `manor` - Palazzo nobiliare
- `cave` - Grotta naturale
- `tower` - Torre isolata
- `monastery` - Monastero abbandonato

**Stanze disponibili:**
- `dormitory`, `kitchen`, `armory`, `laboratory`, `library`
- `chapel`, `stable`, `warehouse`, `workshop`, `kennel`
- `prison`, `tower`, `dungeon`, `throne-room`

**Esempi:**
```
/haven create "Il Covo del Lupo" tavern
/haven upgrade dormitory        # Migliora dormitorio esistente
/haven status                   # Mostra: "Rifugio attivo con 5 stanze"
/haven events                   # Eventi settimanali casuali
```

## 💼 Sistema Lavori Sporchi

### Generazione Lavori
```
/lavori generate <tipo> <difficolta>    # Genera un lavoro sporco
/lavori list                           # Lista lavori disponibili
/lavori accept <id>                     # Accetta un lavoro
/lavori complete <id>                   # Completa lavoro con successo
/lavori fail <id>                       # Fallisce il lavoro
/lavori complications                   # Mostra complicazioni possibili
```

**Tipi di lavoro disponibili:**
- `robbery` - Rapina
- `extortion` - Estorsione
- `smuggling` - Contrabbando
- `assassination` - Assassinio
- `kidnapping` - Rapimento
- `burglary` - Furto con scasso
- `fraud` - Truffa

**Difficoltà disponibili:**
- `easy` - CD 10-12, ricompensa bassa
- `medium` - CD 13-15, ricompensa media
- `hard` - CD 16-18, ricompensa alta

**Esempi:**
```
/lavori generate robbery medium    # Rapina di difficoltà media
/lavori list                      # Mostra lavori disponibili
/lavori accept 1                   # Accetta il primo lavoro
```

## 🗲 Sistema Menagramo

### Gestione Maledizioni
```
/menagramo apply <livello>       # Applica menagramo al bersaglio
/menagramo remove                # Rimuove menagramo dal personaggio
/menagramo check                 # Mostra stato menagramo attuale
/menagramo effects               # Lista effetti attivi
/menagramo duration              # Mostra durata rimanente
```

**Livelli disponibili:**
- `minor` - Menagramo Minore (1d4 giorni)
- `moderate` - Menagramo Moderato (2d4 giorni)
- `major` - Menagramo Maggiore (3d4 giorni)

**Esempi:**
```
/menagramo apply moderate        # Applica menagramo moderato
/menagramo check                 # Mostra: "Menagramo moderato attivo"
/menagramo effects               # Lista: "- Svantaggio attacchi e salvezza"
```

## ⚔️ Sistema Duelli

### Gestione Duelli
```
/duello start <avversario1> <avversario2> <tipo>    # Inizia un duello
/duello accept <id>                                # Accetta sfida duello
/duello decline <id>                               # Rifiuta sfida duello
/duello status                                     # Mostra duelli attivi
/duello rules <tipo>                               # Mostra regole duello
/duello styles                                     # Lista stili disponibili
```

**Tipi di duello disponibili:**
- `primo_sangue` - Al primo sangue
- `sottomissione` - Alla sottomissione
- `morte` - All'ultimo respiro

**Stili di combattimento:**
- `sword_dagger` - Spada e pugnale
- `sword_shield` - Spada e scudo
- `two_weapons` - Due armi
- `two_handed` - Arma a due mani
- `firearm` - Arma da fuoco

**Esempi:**
```
/duello start @player1 @player2 primo_sangue
/duello accept 1                # Accetta la sfida
/duello rules morte             # Mostra regole duello mortale
```

## 🦠 Sistema Malattie

### Gestione Malattie
```
/malattia infect <malattia> <bersaglio>    # Infetta con malattia
/malattia cure <metodo>                    # Tenta di curare malattia
/malattia status                            # Mostra malattie attive
/malattia symptoms                          # Mostra sintomi attuali
/malattia progression                       # Mostra progressione malattia
/malattia diseases                          # Lista tutte le malattie
```

**Malattie disponibili:**
- `febbre_palustre` - Febbre da palude
- `peste_nera` - Peste bubbonica
- `sifilide` - Malattia venerea
- `tifo_petecchiale` - Febbre tifoide
- `vaiolo` - Vaiolo
- `tubercolosi` - TBC
- `rabbia` - Rabbia
- `dissenteria` - Dissenteria

**Metodi di cura:**
- `natural` - Riposo e cure naturali
- `medical` - Medicine e dottori
- `magical` - Magia curativa

**Esempi:**
```
/malattia infect febbre_palustre @player1
/malattia cure medical         # Prova cura medica
/malattia status               # Mostra malattie del personaggio
```

## 🌍 Sistema Hazard Ambientali

### Eventi Ambientali
```
/hazard trigger <tipo> <bersaglio>          # Attiva hazard ambientale
/hazard list                               # Lista hazard disponibili
/hazard effects <tipo>                     # Mostra effetti hazard
/hazard survival <tipo>                    # Prova sopravvivenza
/hazard resolve                            # Risolve hazard attivo
```

**Tipi di hazard disponibili:**
- `landslide` - Frana
- `flood` - Alluvione
- `fire` - Incendio
- `storm` - Tempesta
- `collapse` - Crollo strutturale
- `epidemic` - Epidemia
- `riot` - Sommossa
- `magical` - Hazard magico

**Esempi:**
```
/hazard trigger landslide @player1
/hazard survival landslide     # TS sopravvivenza contro frana
/hazard resolve                # Risolve hazard attivo
```

## 🏛️ Sistema Fazioni

### Gestione Fazioni
```
/fazione join <fazione>                    # Unisciti a una fazione
/fazione leave                             # Abbandona fazione attuale
/fazione reputation <fazione> <valore>     # Modifica reputazione
/fazione status <fazione>                  # Mostra stato fazione
/fazione quests <fazione>                  # Missioni disponibili
/fazione ranks <fazione>                   # Gradi fazione
/fazione benefits <fazione>                # Benefici reputazione
```

**Fazioni disponibili:**
- `chiesa_calendaria` - Chiesa ufficiale
- `nobiltà` - Nobili e aristocratici
- `gilde_mercanti` - Mercanti e commercianti
- `ordine_draconiano` - Cavalieri e soldati
- `societa_segrete` - Società segrete
- `cultisti` - Setta religiosa alternativa
- `banditi` - Fuorilegge organizzati
- `spie` - Rete di spionaggio

**Esempi:**
```
/fazione join chiesa_calendaria
/fazione reputation chiesa_calendaria 15
/fazione status chiesa_calendaria
/fazione quests chiesa_calendaria
```

## 🎨 Sistema Baraonda (Risse)

### Gestione Risse
```
/rissa start                            # Inizia una rissa da taverna
/rissa join                             # Unisciti alla rissa attiva
/rissa leave                            # Abbandona la rissa
/rissa status                           # Stato rissa attuale
/rissa moves                            # Mosse disponibili
/rissa attack <bersaglio> <mossa>       # Attacca in rissa
/rissa defend                           # Difesa speciale
```

**Mosse disponibili:**
- `pugno` - Attacco base
- `testata` - Attacco potente
- `sgambetto` - Atterra avversario
- `bicchierata` - Usa bicchiere
- `bottiglia` - Rompe bottiglia
- `sedia` - Usa sedia come arma
- `tavolo` - Ribalta tavolo

**Esempi:**
```
/rissa start                    # Inizia rissa in taverna
/rissa join                     # Partecipa alla rissa
/rissa attack @player1 pugno    # Attacca con pugno
```

## 💰 Sistema Equipaggiamento Scadente

### Gestione Equipaggiamento
```
/equipaggiamento repair <oggetto>       # Ripara oggetto scadente
/equipaggiamento quality <oggetto>      # Controlla qualità oggetto
/equipaggiamento durability <oggetto>   # Mostra durata rimanente
/equipaggiamento break <oggetto>        # Forza rottura oggetto
/equipaggiamento list                   # Lista oggetti scadenti
```

**Esempi:**
```
/equipaggiamento repair spada_scadente
/equipaggiamento quality armatura_scadente
/equipaggiamento durability balestra_scadente
```

## 🏷️ Sistema Taglie e Malefatte

### Gestione Taglie
```
/taglia add <crimine> <valore> <bersaglio>    # Aggiunge taglia
/taglia remove <id>                          # Rimuove taglia
/taglia list                                 # Lista taglie attive
/taglia bounty <id>                          # Riscuote taglia
/taglia crimes                               # Lista crimini disponibili
```

**Crimini disponibili:**
- `furto_minore`, `furto_maggiore`, `rapina`
- `estorsione`, `contrabbando`, `omicidio_comune`
- `omicidio_nobile`, `tradimento`, `pirateria`
- `sedizione`, `sacrilegio`, `eresia`

**Esempi:**
```
/taglia add omicidio_comune 500 @player1
/taglia list                    # Mostra taglie del personaggio
/taglia bounty 1                # Riscuote la taglia #1
```

## 🎯 Sistema Emeriticenze

### Gestione Privilegi
```
/emeriticenze list                      # Lista emeriticenze disponibili
/emeriticenze unlock <nome>             # Sblocca emeriticenza
/emeriticenze status                    # Stato emeriticenze personaggio
/emeriticenze effects                   # Effetti attivi emeriticenze
```

**Emeriticenze disponibili:**
- `affinamento`, `energumeno`, `rissaiolo_professionista`
- `indomito`, `recupero_migliorato`, `dono_del_talento`
- `fandonia_potenziata`, `gioco_di_squadra`, `emeriticenza_assoluta`

**Esempi:**
```
/emeriticenze list              # Mostra tutte disponibili
/emeriticenze unlock energumeno  # Sblocca potenziamento fisico
```

## 🎲 Eventi Casuali

### Generazione Eventi
```
/evento strada                          # Evento casuale stradale
/evento rifugio                         # Evento del rifugio
/evento clima                           # Evento climatico
/evento sogno                           # Sogno o presagio
/evento incontro                        # Incontro casuale
```

**Esempi:**
```
/evento strada                  # Evento sulla strada principale
/evento rifugio                 # Evento settimanale del rifugio
/evento clima                   # Evento atmosferico
```

## 🛠️ Comandi di Debug e Utility

### Debug e Diagnostica
```
/debug systems                          # Stato tutti i sistemi
/debug modules                          # Moduli attivi
/debug settings                         # Impostazioni modulo
/debug reset <sistema>                  # Reset sistema specifico
/debug log <livello>                    # Imposta livello logging
```

### Utility Varie
```
/roll <espressione>                     # Tiro dado custom
/theme preset <nome>                    # Cambia preset tema
/theme colors                           # Mostra colori attuali
/music play <traccia>                   # Riproduci musica ambient
/music stop                             # Ferma musica
```

---

**Nota**: Alcuni comandi richiedono di essere GM per funzionare. I comandi sono contestuali e possono variare in base al sistema attivo.

Per una lista completa dei comandi disponibili in qualsiasi momento, digita `/help` nella chat di Foundry VTT.

