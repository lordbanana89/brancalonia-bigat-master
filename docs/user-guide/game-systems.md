# 🎮 Sistemi di Gioco - Brancalonia

Questa sezione descrive tutti i sistemi di gioco implementati nel modulo Brancalonia.

## 🎭 Sistema Infamia e Reputazione

### Come Funziona
Il sistema di **Infamia** (0-100 punti) determina la notorietà del personaggio nel Regno di Taglia:

| Livello | Nome | Effetti |
|---------|------|---------|
| 0-10 | **Sconosciuto** | Nessun effetto |
| 10-25 | **Poco Noto** | Sconti dai criminali |
| 25-50 | **Mal Visto** | -1 Persuasione con autorità |
| 50-75 | **Ricercato** | Taglie minori, controlli frequenti |
| 75-100 | **Fuorilegge** | Bandito dalle città, cacciatori di taglie |
| 100+ | **Nemico Pubblico** | Kill on sight, taglie enormi |

### Azioni che Aumentano l'Infamia
- **Furto Minore**: +1 punto
- **Furto Maggiore**: +3 punti
- **Rapina**: +5 punti
- **Estorsione**: +3 punti
- **Omicidio Comune**: +8 punti
- **Omicidio Nobile**: +15 punti
- **Tradimento**: +10 punti

### Reputazione Positiva
Puoi anche guadagnare **reputazione positiva** in categorie come:
- **Onore**: Azioni nobili e giuste
- **Fama**: Riconoscimento pubblico
- **Devozione**: Servizio religioso
- **Lealtà**: Fedeltà a cause superiori

## 🏠 Sistema Compagnia

### Gestione del Gruppo
- **Massimo 6 membri** per compagnia
- **Reputazione condivisa** (media del gruppo)
- **Risorse comuni** (tesoro, equipaggiamento)
- **Gerarchia interna** (capitano, luogotenenti, soldati)

### Benefici della Compagnia
- **Divisione ricompense** tra membri
- **Supporto reciproco** in combattimento
- **Rete di contatti** più ampia
- **Reputazione collettiva**

## 🏰 Sistema Haven (Rifugi)

### Tipi di Stanze Disponibili

| Stanza | Costo | Benefici |
|--------|-------|----------|
| **Dormitorio** | 100 mo | +1 dado vita per riposo |
| **Cucina** | 150 mo | +2 HP, rimuove sfinimento |
| **Armeria** | 200 mo | 50% sconto riparazioni |
| **Laboratorio** | 300 mo | Pozioni e veleni |
| **Biblioteca** | 250 mo | +2 conoscenze |
| **Cappella** | 200 mo | Cure divine |
| **Stalla** | 150 mo | Cavalli e trasporti |
| **Magazzino** | 100 mo | Deposito sicuro |
| **Officina** | 180 mo | Costruzioni/riparazioni |
| **Cucce** | 120 mo | Animali da guardia |
| **Prigione** | 200 mo | Celle per prigionieri |
| **Torre** | 300 mo | Vedetta e difesa |
| **Segrete** | 150 mo | Torture/interrogatori |
| **Sala del trono** | 500 mo | Status sociale elevato |

### Eventi Casuali del Rifugio
Ogni settimana il rifugio può generare eventi casuali:
- **Visitatori** (mercanti, spie, cacciatori di taglie)
- **Problemi interni** (rifornimenti, manutenzione)
- **Opportunità** (contatti utili, informazioni)

## 💼 Sistema Lavori Sporchi

### Tipi di Lavoro Disponibili

#### Rapina
- **Facile**: CD 12, Ricompensa 2d6×10 mo, Infamia +3
- **Media**: CD 15, Ricompensa 4d6×10 mo, Infamia +5
- **Difficile**: CD 18, Ricompensa 8d6×10 mo, Infamia +8

#### Estorsione
- **Facile**: CD 10, Ricompensa 1d6×10 mo, Infamia +2
- **Media**: CD 13, Ricompensa 2d6×10 mo, Infamia +3
- **Difficile**: CD 16, Ricompensa 4d6×10 mo, Infamia +5

#### Contrabbando
- **Facile**: CD 11, Ricompensa 3d6×10 mo, Infamia +1
- **Media**: CD 14, Ricompensa 6d6×10 mo, Infamia +2
- **Difficile**: CD 17, Ricompensa 10d6×10 mo, Infamia +4

### Complicazioni Possibili
- Le guardie sono state allertate
- Il bottino è maledetto
- Un testimone vi ha riconosciuti
- La refurtiva è marchiata

## 🗲 Sistema Menagramo (Sfortuna)

### Livelli di Menagramo

| Livello | Nome | Durata | Effetti |
|---------|------|--------|---------|
| **Minore** | Menagramo Minore | 1d4 giorni | Svantaggio su una prova a scelta del GM |
| **Moderato** | Menagramo Moderato | 2d4 giorni | Svantaggio su tutti i tiri di attacco e salvezza |
| **Maggiore** | Menagramo Maggiore | 3d4 giorni | Svantaggio su TUTTI i tiri |

### Modi per Contrarre il Menagramo
- **Fallire miseramente** prove importanti
- **Offendere entità soprannaturali**
- **Romper tabù** culturali o religiosi
- **Essere maledetti** da streghe o spiriti

### Rimozione del Menagramo
- **Ritiro sociale** in un monastero (1 settimana)
- **Pellegrinaggio** a un luogo sacro
- **Magia**: *Rimuovi maledizione* o *Ristorare*
- **Espiazione** tramite azioni positive

## ⚔️ Sistema Duelli Formali

### Tipi di Duello

#### Al Primo Sangue
- Termina al primo colpo che causa danno
- Non letale, solo ferite superficiali
- **Ricompensa**: Vincitore -5 infamia, +10 reputazione

#### Alla Sottomissione
- Termina quando uno si arrende
- Massimo 10 round
- **Ricompensa**: Vincitore -3 infamia, +15 reputazione

#### All'Ultimo Respiro
- Duello mortale fino alla fine
- **Ricompensa**: Vincitore +20 reputazione, perdente morte

### Stili di Combattimento
1. **Spada e Pugnale** - Stile classico italiano
2. **Spada e Scudo** - Difesa rinascimentale
3. **Due Armi** - Stile aggressivo
4. **Arma a Due Mani** - Potenza massima
5. **Arma da Fuoco** - Per i più moderni

## 🦠 Sistema Malattie

### Malattie Implementate

#### Febbre Palustre
- **Incubazione**: 1d4 giorni
- **Fase 1** (1d4 giorni): -5 HP massimi, svantaggio TS Costituzione
- **Fase 2** (2d4 giorni): -10 HP massimi, -2 Forza, svantaggio tutto
- **Fase 3** (permanente): 3 livelli sfinimento

#### Peste Nera
- **Incubazione**: 1d6 giorni
- **Fase 1** (1d3 giorni): -10 HP massimi, -2 Costituzione
- **Fase 2** (1d6 giorni): Morte apparente (coma)
- **Contagio**: Contatto diretto, probabilità 25%

#### Altre Malattie
- **Sifilide**: Malattia venerea, effetti a lungo termine
- **Tifo Petecchiale**: Febbre alta, delirio
- **Vaiolo**: Cicatrici permanenti, -2 Carisma
- **Tubercolosi**: Debolezza progressiva
- **Rabbia**: Da morsi di animali
- **Dissenteria**: Debilitante, rischio disidratazione

### Cure Disponibili
- **Naturali**: Riposo lungo + TS Costituzione giornalieri
- **Mediche**: Medicina CD 15 + erbe medicinali
- **Magiche**: *Ristorare inferiore/superiore*

## 🏛️ Sistema Fazioni

### Fazioni Principali

#### Chiesa Calendaria
- **Tipo**: Religiosa
- **Allineamento**: Legale
- **Potere**: 9/10
- **Sede**: Vaticantica
- **Leader**: Papa Innocenzo XXIII

#### Nobiltà
- **Tipo**: Politica
- **Allineamento**: Neutrale
- **Potere**: 8/10
- **Sede**: Varie città principali

#### Gilde Mercantili
- **Tipo**: Economica
- **Allineamento**: Neutrale
- **Potere**: 7/10
- **Sede**: Porti commerciali

#### Ordine Draconiano
- **Tipo**: Militare
- **Allineamento**: Legale
- **Potere**: 8/10
- **Sede**: Caserme principali

### Benefici per Reputazione

| Reputazione | Chiesa | Nobiltà | Mercanti |
|-------------|--------|---------|----------|
| **Alleato** | Cure gratuite | Protezione legale | Sconti 20% |
| **Onorato** | Immunità diplomatica | Titoli nobiliari | Partnership commerciali |
| **Venerato** | Benedizioni potenti | Terre in dono | Ricchezze immense |

## 🌍 Hazard Ambientali

### Tipi di Pericoli

#### Naturali
- **Frane** - Terreni instabili
- **Alluvioni** - Fiumi in piena
- **Incendi boschivi** - Foreste in fiamme
- **Tempeste** - Fulmini e venti forti

#### Urbani
- **Crolli strutturali** - Edifici pericolanti
- **Incendi cittadini** - Propagazione rapida
- **Sommosse** - Rivolte popolari
- **Epidemie** - Contagi diffusi

#### Dungeon
- **Trappole meccaniche** - Antiche difese
- **Gas tossici** - Antiche maledizioni
- **Crolli** - Strutture instabili
- **Mostri territoriali** - Difensori naturali

#### Magici
- **Zone morte magica** - Nessuna magia funziona
- **Tempeste arcane** - Fulmini magici
- **Maledizioni antiche** - Effetti permanenti
- **Portali instabili** - Teletrasporto casuale

## 🎲 Sistema Rischi del Mestiere

### Eventi Casuali per Lavori

Durante i lavori sporchi possono verificarsi **23 eventi** diversi:

1. **Tradimento interno** - Un complice vi vende
2. **Guardie corrotte** - Richiedono tangente extra
3. **Bottino difettoso** - Oggetti di scarso valore
4. **Testimoni oculari** - Qualcuno vi ha visti
5. **Complicazioni magiche** - Incantesimi impazziti
6. **Problemi tecnici** - Equipaggiamento rotto
7. **Concorrenza sleale** - Altri criminali
8. **Vittime problematiche** - Bersagli che reagiscono
9. **Alleati inattendibili** - Aiutanti poco fidati
10. **Trappole nascoste** - Difese inaspettate

## 🎨 Sistema Baraonda (Risse)

### Meccanica delle Risse
- **Punti Baraonda**: Accumuli punti durante la serata
- **Livelli di ubriachezza**: Sempre più scoordinati
- **Batoste**: Sistema di colpi (KO a 3 batoste)
- **Mosse speciali**: Bicchierata, testata, sgambetto

### Armi Improvvisate
- **Bottiglia**: 1d4 danni, rompe dopo uso
- **Sedia**: 1d6 danni, ingombrante
- **Tavolo**: 1d8 danni, due mani
- **Candeliere**: 1d4 danni +1d4 fuoco

## 💰 Sistema Equipaggiamento Scadente

### Qualità dell'Equipaggiamento

| Qualità | Durata | Modificatore | Effetto |
|---------|--------|--------------|---------|
| **Scadente** | 1d4 usi | -1 ai tiri | Si rompe facilmente |
| **Normale** | 2d6 usi | +0 | Funziona normalmente |
| **Buona** | 3d8 usi | +1 ai tiri | Più resistente |
| **Eccellente** | Permanente | +2 ai tiri | Qualità superiore |

### Riparazione
- **Costo**: 10-50% del valore originale
- **Tempo**: 1 ora per oggetto semplice
- **Prove**: Artigianato CD 12-18 a seconda della qualità

## 🏷️ Sistema Taglie e Malefatte

### Tipi di Malefatte
- **Furto**: Sottrazione beni altrui
- **Rapina**: Furto con violenza
- **Estorsione**: Ricatto e minacce
- **Contrabbando**: Commercio illegale
- **Omicidio**: Uccisione deliberata
- **Tradimento**: Violazione patti sacri
- **Pirateria**: Attacchi in mare
- **Sedizione**: Rivolta contro l'autorità

### Sistema di Taglie
- **Taglie minori**: 50-200 mo
- **Taglie maggiori**: 500-2000 mo
- **Taglie enormi**: 5000+ mo
- **Cacciatori di taglie**: NPC specializzati

## 🎯 Sistema Emeriticenze

### Privilegi Post-6° Livello

#### Combattimento
- **Affinamento**: Specializzazione armi
- **Energumeno**: +2 Forza/Costituzione
- **Rissaiolo Professionista**: Maestro delle risse

#### Sopravvivenza
- **Indomito**: Resistere a condizioni estreme
- **Recupero Migliorato**: Guarigione rapida
- **Il Dono del Talento**: Talento bonus

#### Sociale
- **Fandonia Potenziata**: Bugie incredibili
- **Gioco di Squadra**: Supporto compagni
- **Emeriticenza Assoluta**: Maestria completa

## 🎲 Eventi Casuali del Regno

### Incontri Stradali (50+ eventi)
- **Mercanti itineranti** - Venditori ambulanti
- **Pellegrini** - Viaggiatori religiosi
- **Banditi** - Agguati stradali
- **Animali selvatici** - Incontri pericolosi
- **Fenomeni naturali** - Eventi atmosferici

### Eventi del Rifugio (20+ eventi)
- **Visitatori inattesi** - Ospiti sorpresa
- **Problemi di manutenzione** - Riparazioni necessarie
- **Scoperte fortunate** - Tesori nascosti
- **Spie infiltrate** - Sicurezza compromessa

### Eventi Climatici (15+ eventi)
- **Pioggia torrenziale** - Visibilità ridotta
- **Nebbia fitta** - Orientamento difficile
- **Caldo torrido** - Spossatezza
- **Freddo glaciale** - Rischio ipotermia

---

Questa documentazione copre tutti i sistemi principali di Brancalonia. Per dettagli specifici consulta i compendi **Regole** inclusi nel modulo.

